<?php

namespace Tests\Feature;

use App\Models\AttendanceCorrectionRequest;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\LeaveRequest;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\PerformancePeriod;
use App\Models\PerformanceReview;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class PortalPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_user_can_open_portal_page(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('portal.index'))
            ->assertOk();
    }

    public function test_admin_is_redirected_to_dashboard_when_opening_portal_page(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('portal.index'))
            ->assertRedirect(route('dashboard'));
    }

    public function test_verified_user_can_open_self_service_pages(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user);

        $this->get(route('portal.attendance'))->assertOk();
        $this->get(route('portal.leaves'))->assertOk();
        $this->get(route('portal.overtimes'))->assertOk();
        $this->get(route('portal.kasbons'))->assertOk();
        $this->get(route('portal.payroll'))->assertOk();
        $this->get(route('portal.activity'))->assertOk();
    }

    public function test_user_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('portal.index'));

        $this->actingAs($user)
            ->get(route('settings.users.index'))
            ->assertRedirect(route('portal.index'));

        $this->actingAs($user)
            ->get(route('hris.employees.index'))
            ->assertRedirect(route('portal.index'));
    }

    public function test_portal_summary_api_returns_user_focused_payload(): void
    {
        $user = User::factory()->create([
            'name' => 'Portal User',
            'email' => 'portal@example.com',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $user->id,
            'name' => 'Operations',
        ]);

        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'name' => 'Coordinator',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
            'employment_status' => 'active',
            'employment_type' => 'permanent',
        ]);

        EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => today()->toDateString(),
            'status' => 'present',
        ]);

        LeaveRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'start_date' => today()->copy()->addDay()->toDateString(),
            'end_date' => today()->copy()->addDays(2)->toDateString(),
            'total_days' => 2,
            'status' => 'approved',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => now()->format('Y-m'),
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
            'is_saved' => false,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 6000000,
            'allowances_total' => 500000,
            'kasbon_deduction' => 0,
            'denda_deduction' => 0,
            'deductions_total' => 0,
            'net_salary' => 6500000,
            'allowance_breakdown' => ['Transport' => 500000],
        ]);

        $response = $this->actingAs($user)
            ->getJson(route('portal.api.summary'));

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'portal@example.com')
            ->assertJsonPath('data.employee.email', 'portal@example.com')
            ->assertJsonPath('data.quick_action.attendance.status', 'present')
            ->assertJsonPath('data.cards.annual_leave_days', 2)
            ->assertJsonPath('data.cards.payroll_preview.period', now()->format('Y-m'))
            ->assertJsonPath('data.links.activity', route('portal.activity'));
    }

    public function test_portal_user_can_manage_active_performance_activity(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'name' => 'Portal User',
            'email' => 'portal@example.com',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $user->id,
            'name' => 'Operations',
        ]);

        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'name' => 'Coordinator',
        ]);

        $manager = Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'manager_id' => $manager->id,
            'email' => $user->email,
            'employment_status' => 'active',
        ]);

        $period = PerformancePeriod::query()->create([
            'user_id' => $user->id,
            'name' => 'June 2026',
            'starts_at' => '2026-06-01',
            'ends_at' => '2026-06-30',
            'status' => 'active',
        ]);

        $review = PerformanceReview::query()->create([
            'user_id' => $user->id,
            'performance_period_id' => $period->id,
            'employee_id' => $employee->id,
            'manager_id' => $manager->id,
            'status' => 'not_started',
            'okr_score' => 50,
            'kpi_score' => 80,
            'final_score' => 57,
        ]);

        $this->actingAs($user)
            ->getJson(route('portal.api.performances.index'))
            ->assertOk()
            ->assertJsonPath('data.items.0.id', $review->id)
            ->assertJsonPath('data.items.0.period.name', 'June 2026');

        $this->actingAs($user)
            ->postJson(route('portal.api.performances.check-ins.store', $review), [
                'check_in_date' => '2026-06-10',
                'summary' => 'Progress OKR minggu ini sudah diupdate.',
                'action_items' => 'Lanjut follow up target KPI.',
                'status' => 'open',
            ])
            ->assertCreated()
            ->assertJsonPath('data.check_in.summary', 'Progress OKR minggu ini sudah diupdate.');

        $review->refresh();

        $this->assertSame('in_progress', $review->status);
        $this->assertDatabaseHas('performance_check_ins', [
            'performance_review_id' => $review->id,
            'summary' => 'Progress OKR minggu ini sudah diupdate.',
        ]);
    }

    public function test_portal_summary_uses_browser_timezone_for_attendance_times(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-04-23 03:51:00', 'UTC'));

        try {
            $user = User::factory()->create([
                'name' => 'Portal User',
                'email' => 'portal@example.com',
                'email_verified_at' => now(),
            ]);

            $division = Division::factory()->create([
                'user_id' => $user->id,
                'name' => 'Operations',
            ]);

            $position = Position::factory()->create([
                'user_id' => $user->id,
                'division_id' => $division->id,
                'name' => 'Coordinator',
            ]);

            $employee = Employee::factory()->create([
                'user_id' => $user->id,
                'division_id' => $division->id,
                'position_id' => $position->id,
                'email' => $user->email,
                'employment_status' => 'active',
                'employment_type' => 'permanent',
            ]);

            EmployeeAttendance::factory()->create([
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'attendance_date' => '2026-04-23',
                'status' => 'present',
                'check_in_at' => '2026-04-23 11:51:00',
                'check_out_at' => '2026-04-23 20:00:00',
            ]);

            $response = $this->actingAs($user)
                ->withHeader('X-Timezone', 'Asia/Makassar')
                ->getJson(route('portal.api.summary'));

            $response
                ->assertOk()
                ->assertJsonPath('data.quick_action.attendance.check_in_at', '2026-04-23T19:51:00+08:00')
                ->assertJsonPath('data.quick_action.attendance.check_out_at', '2026-04-24T04:00:00+08:00');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_attendance_correction_request_stores_utc_and_returns_device_local_times(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'correction@example.com',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $user->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
        ]);

        Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
            'employment_status' => 'active',
            'employment_type' => 'permanent',
        ]);

        $this->actingAs($user)
            ->withHeader('X-Timezone', 'Asia/Makassar')
            ->postJson(route('portal.api.attendance-requests.store'), [
                'attendance_date' => '2026-05-19',
                'check_in_at' => '2026-05-19T09:30:00',
                'check_out_at' => '2026-05-19T18:00:00',
                'reason' => 'Lupa clock in dari portal.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.check_in_at', '2026-05-19T09:30:00+08:00')
            ->assertJsonPath('data.check_out_at', '2026-05-19T18:00:00+08:00');

        $attendanceRequest = AttendanceCorrectionRequest::query()->firstOrFail();

        $this->assertSame('2026-05-19 01:30:00', $attendanceRequest->check_in_at?->format('Y-m-d H:i:s'));
        $this->assertSame('2026-05-19 10:00:00', $attendanceRequest->check_out_at?->format('Y-m-d H:i:s'));

        $this->actingAs($user)
            ->withHeader('X-Timezone', 'Asia/Jayapura')
            ->getJson(route('portal.api.attendance-requests.index'))
            ->assertOk()
            ->assertJsonPath('data.items.0.check_in_at', '2026-05-19T10:30:00+09:00')
            ->assertJsonPath('data.items.0.check_out_at', '2026-05-19T19:00:00+09:00');
    }

    public function test_user_can_export_own_payslip_pdf(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'portal@example.com',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'name' => 'Operations',
        ]);

        $position = Position::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'name' => 'Coordinator',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
            'birth_date' => '1995-05-12',
            'employment_status' => 'active',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'period' => now()->format('Y-m'),
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
            'is_saved' => true,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->accountOwnerId(),
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 6000000,
            'allowances_total' => 500000,
            'kasbon_deduction' => 0,
            'denda_deduction' => 0,
            'deductions_total' => 0,
            'net_salary' => 6500000,
            'allowance_breakdown' => ['Transport' => 500000],
        ]);

        $this->actingAs($user)
            ->get(route('portal.payroll.export', [
                'period' => now()->format('Y-m'),
                'birth_date' => '1995-05-12',
            ]))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_user_cannot_export_payslip_without_birth_date_verification(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'portal@example.com',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'name' => 'Operations',
        ]);

        $position = Position::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'name' => 'Coordinator',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
            'birth_date' => '1995-05-12',
            'employment_status' => 'active',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'period' => now()->format('Y-m'),
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
            'is_saved' => true,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->accountOwnerId(),
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 6000000,
            'allowances_total' => 500000,
            'kasbon_deduction' => 0,
            'denda_deduction' => 0,
            'deductions_total' => 0,
            'net_salary' => 6500000,
            'allowance_breakdown' => ['Transport' => 500000],
        ]);

        $this->actingAs($user)
            ->getJson(route('portal.payroll.export', ['period' => now()->format('Y-m')]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['birth_date']);
    }

    public function test_user_cannot_export_payslip_with_wrong_birth_date(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email' => 'portal@example.com',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'name' => 'Operations',
        ]);

        $position = Position::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'name' => 'Coordinator',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $user->email,
            'birth_date' => '1995-05-12',
            'employment_status' => 'active',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->accountOwnerId(),
            'period' => now()->format('Y-m'),
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
            'is_saved' => true,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->accountOwnerId(),
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 6000000,
            'allowances_total' => 500000,
            'kasbon_deduction' => 0,
            'denda_deduction' => 0,
            'deductions_total' => 0,
            'net_salary' => 6500000,
            'allowance_breakdown' => ['Transport' => 500000],
        ]);

        $this->actingAs($user)
            ->getJson(route('portal.payroll.export', [
                'period' => now()->format('Y-m'),
                'birth_date' => '1990-01-01',
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['birth_date']);
    }
}
