<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeLeaveBalance;
use App\Models\LeavePolicy;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Services\LeaveBalanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class LeavePolicyCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_annual_basis_grants_the_full_entitlement_after_the_waiting_period(): void
    {
        [$employee, $policy] = $this->employeeAndPolicy('annual', '2024-01-10', 12, 12);

        $calculation = app(LeaveBalanceService::class)->calculateEntitlement(
            $employee,
            $policy,
            Carbon::parse('2026-02-01')
        );

        $this->assertSame(12.0, $calculation['total_quota']);
        $this->assertSame(12.0, $calculation['accrued_days']);
        $this->assertSame('2026-01-01', $calculation['period_start']);
        $this->assertSame('2026-12-31', $calculation['period_end']);
    }

    public function test_prorata_basis_uses_remaining_months_from_the_hire_date(): void
    {
        [$employee, $policy] = $this->employeeAndPolicy('prorated', '2026-07-15');

        $calculation = app(LeaveBalanceService::class)->calculateEntitlement(
            $employee,
            $policy,
            Carbon::parse('2026-08-01')
        );

        $this->assertSame(6.0, $calculation['total_quota']);
        $this->assertSame(6.0, $calculation['accrued_days']);
    }

    public function test_monthly_accrual_adds_entitlement_for_each_completed_month(): void
    {
        [$employee, $policy] = $this->employeeAndPolicy('monthly_accrual', '2026-01-01');

        $calculation = app(LeaveBalanceService::class)->calculateEntitlement(
            $employee,
            $policy,
            Carbon::parse('2026-06-01')
        );

        $this->assertSame(12.0, $calculation['total_quota']);
        $this->assertSame(5.0, $calculation['accrued_days']);

        $employee->update(['hire_date' => '2026-07-15']);
        $calculation = app(LeaveBalanceService::class)->calculateEntitlement(
            $employee->refresh(),
            $policy,
            Carbon::parse('2026-12-31')
        );

        $this->assertSame(5.0, $calculation['accrued_days']);
    }

    public function test_monthly_accrual_uses_hire_date_period_and_releases_accumulation_after_waiting_period(): void
    {
        [$employee, $policy] = $this->employeeAndPolicy('monthly_accrual', '2026-07-01', 3);
        $service = app(LeaveBalanceService::class);

        $beforeEligibility = $service->calculateEntitlement(
            $employee,
            $policy,
            Carbon::parse('2026-09-30')
        );
        $onEligibility = $service->calculateEntitlement(
            $employee,
            $policy,
            Carbon::parse('2026-10-01')
        );
        $afterCalendarYearChanges = $service->calculateEntitlement(
            $employee,
            $policy,
            Carbon::parse('2027-01-01')
        );

        $this->assertSame('2026-07-01', $onEligibility['period_start']);
        $this->assertSame('2027-06-30', $onEligibility['period_end']);
        $this->assertSame(0.0, $beforeEligibility['accrued_days']);
        $this->assertSame(3.0, $onEligibility['accrued_days']);
        $this->assertSame(6.0, $afterCalendarYearChanges['accrued_days']);
        $this->assertSame(2026, $afterCalendarYearChanges['balance_year']);
    }

    public function test_anniversary_basis_uses_the_employee_hire_date_for_its_period(): void
    {
        [$employee, $policy] = $this->employeeAndPolicy('anniversary', '2024-03-01');

        $calculation = app(LeaveBalanceService::class)->calculateEntitlement(
            $employee,
            $policy,
            Carbon::parse('2026-07-21')
        );

        $this->assertSame(12.0, $calculation['accrued_days']);
        $this->assertSame('2026-03-01', $calculation['period_start']);
        $this->assertSame('2027-02-28', $calculation['period_end']);
        $this->assertSame(2026, $calculation['balance_year']);
    }

    public function test_employee_cannot_take_annual_leave_before_the_waiting_period(): void
    {
        [$employee, $policy] = $this->employeeAndPolicy('annual', '2026-01-15', 3);

        $message = app(LeaveBalanceService::class)->requestEligibilityError(
            $employee,
            $policy,
            Carbon::parse('2026-04-14'),
            1
        );

        $this->assertSame('Cuti tahunan baru dapat diambil mulai 15 April 2026.', $message);
    }

    public function test_policy_endpoint_saves_all_calculation_settings(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)
            ->post(route('hris.leaves.policy.store'), [
                'leave_type' => 'annual',
                'policy_type' => 'anniversary',
                'yearly_days' => 18,
                'waiting_period_months' => 6,
                'max_days_per_request' => 5,
                'approval_levels' => 2,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('leave_policies', [
            'user_id' => $user->id,
            'leave_type' => 'annual',
            'policy_type' => 'anniversary',
            'yearly_days' => 18,
            'waiting_period_months' => 6,
            'max_days_per_request' => 5,
            'approval_levels' => 2,
        ]);
    }

    public function test_leave_request_enforces_waiting_period_and_optional_day_limit(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2026-01-15',
        ]);
        LeavePolicy::query()->create([
            'user_id' => $user->id,
            'leave_type' => 'annual',
            'policy_type' => 'annual',
            'yearly_days' => 12,
            'waiting_period_months' => 3,
            'max_days_per_request' => 2,
            'is_active' => true,
        ]);

        $basePayload = [
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'reason' => 'Keperluan keluarga',
            'status' => 'pending',
            'rejection_reason' => null,
        ];

        $this->actingAs($user)
            ->post(route('hris.leaves.store'), [
                ...$basePayload,
                'start_date' => '2026-04-14',
                'end_date' => '2026-04-14',
            ])
            ->assertSessionHasErrors([
                'total_days' => 'Cuti tahunan baru dapat diambil mulai 15 April 2026.',
            ]);

        $this->actingAs($user)
            ->post(route('hris.leaves.store'), [
                ...$basePayload,
                'start_date' => '2026-04-15',
                'end_date' => '2026-04-17',
            ])
            ->assertSessionHasErrors([
                'total_days' => 'Maksimal pengajuan cuti tahunan adalah 2 hari sekaligus.',
            ]);

        $this->assertDatabaseCount('leave_requests', 0);
    }

    public function test_two_level_leave_approval_requires_two_different_approvers_before_deducting_balance(): void
    {
        $owner = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        $secondApprover = User::factory()->create([
            'parent_user_id' => $owner->id,
            'role' => 'admin_staff',
            'email_verified_at' => now(),
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'hire_date' => '2024-01-01',
        ]);
        LeavePolicy::query()->create([
            'user_id' => $owner->id,
            'leave_type' => 'annual',
            'policy_type' => 'annual',
            'yearly_days' => 12,
            'waiting_period_months' => 0,
            'max_days_per_request' => null,
            'approval_levels' => 2,
            'is_active' => true,
        ]);
        $leave = LeaveRequest::factory()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-02',
            'total_days' => 2,
            'status' => 'pending',
        ]);

        $this->actingAs($owner)
            ->post(route('hris.leave-approvals.approve', $leave))
            ->assertSessionHas('success', 'Approval tingkat 1 berhasil. Menunggu approval tingkat 2.');

        $this->assertDatabaseHas('leave_requests', [
            'id' => $leave->id,
            'status' => 'pending',
            'approval_stage' => 1,
            'first_approved_by' => $owner->id,
        ]);
        $this->assertDatabaseCount('employee_leave_balances', 0);

        $this->actingAs($owner)
            ->post(route('hris.leave-approvals.approve', $leave))
            ->assertSessionHasErrors(['approval']);

        $this->actingAs($secondApprover)
            ->post(route('hris.leave-approvals.approve', $leave))
            ->assertSessionHas('success', 'Pengajuan cuti disetujui pada tingkat 2.');

        $this->assertDatabaseHas('leave_requests', [
            'id' => $leave->id,
            'status' => 'approved',
            'approval_stage' => 2,
            'approved_by' => $secondApprover->id,
        ]);
        $this->assertSame(2.0, EmployeeLeaveBalance::query()->firstOrFail()->used_days);
    }

    /**
     * @return array{Employee, LeavePolicy}
     */
    private function employeeAndPolicy(
        string $method,
        string $hireDate,
        int $waitingPeriodMonths = 0,
        int $yearlyDays = 12
    ): array {
        $user = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => $hireDate,
        ]);
        $policy = LeavePolicy::query()->create([
            'user_id' => $user->id,
            'leave_type' => 'annual',
            'policy_type' => $method,
            'yearly_days' => $yearlyDays,
            'waiting_period_months' => $waitingPeriodMonths,
            'max_days_per_request' => null,
            'is_active' => true,
        ]);

        return [$employee, $policy];
    }
}
