<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\LeavePolicy;
use App\Models\PublicHoliday;
use App\Models\User;
use App\Services\LeaveBalanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class LeavePolicyNoticePeriodTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_earliest_leave_date_calculates_working_days_excluding_weekends(): void
    {
        $user = User::factory()->create();
        $service = app(LeaveBalanceService::class);

        // Jumat, 9 Oktober 2026
        $asOf = Carbon::parse('2026-10-09');

        // Batas 5 hari kerja:
        // Hari 1: Senin 12 Okt
        // Hari 2: Selasa 13 Okt
        // Hari 3: Rabu 14 Okt
        // Hari 4: Kamis 15 Okt
        // Hari 5: Jumat 16 Okt
        $earliest = $service->calculateEarliestLeaveStartDate($user, 5, $asOf);

        $this->assertSame('2026-10-16', $earliest->toDateString());
    }

    public function test_earliest_leave_date_excludes_public_holidays(): void
    {
        $user = User::factory()->create();
        $service = app(LeaveBalanceService::class);

        // Jumat, 9 Oktober 2026
        $asOf = Carbon::parse('2026-10-09');

        // Selasa, 13 Oktober 2026 libur nasional
        PublicHoliday::create([
            'user_id' => $user->id,
            'date' => '2026-10-13',
            'name' => 'Hari Libur Nasional Contoh',
            'holiday_type' => 'national',
            'is_national_holiday' => true,
        ]);

        // Batas 5 hari kerja:
        // Hari 1: Senin 12 Okt
        // (Selasa 13 Okt diskip karena libur)
        // Hari 2: Rabu 14 Okt
        // Hari 3: Kamis 15 Okt
        // Hari 4: Jumat 16 Okt
        // (Sabtu 17 & Minggu 18 diskip)
        // Hari 5: Senin 19 Okt
        $earliest = $service->calculateEarliestLeaveStartDate($user, 5, $asOf);

        $this->assertSame('2026-10-19', $earliest->toDateString());
    }

    public function test_zero_min_notice_days_allows_immediate_leave(): void
    {
        $user = User::factory()->create();
        $service = app(LeaveBalanceService::class);

        $asOf = Carbon::parse('2026-10-09');
        $earliest = $service->calculateEarliestLeaveStartDate($user, 0, $asOf);

        $this->assertSame('2026-10-09', $earliest->toDateString());
    }

    public function test_leave_request_rejected_if_submitted_before_minimum_notice_period(): void
    {
        Carbon::setTestNow('2026-10-09 10:00:00');

        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2025-01-01',
        ]);

        LeavePolicy::create([
            'user_id' => $user->id,
            'leave_type' => 'annual',
            'policy_type' => 'annual',
            'yearly_days' => 12,
            'waiting_period_months' => 0,
            'min_notice_days' => 5,
            'approval_levels' => 1,
            'is_active' => true,
        ]);

        $payload = [
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'start_date' => '2026-10-15', // Kurang dari 5 hari kerja (paling cepat tgl 16)
            'end_date' => '2026-10-15',
            'reason' => 'Liburan',
            'status' => 'pending',
        ];

        $this->actingAs($user)
            ->post(route('hris.leaves.store'), $payload)
            ->assertSessionHasErrors(['start_date', 'total_days']);

        $this->assertDatabaseCount('leave_requests', 0);
    }

    public function test_leave_request_accepted_if_submitted_on_or_after_earliest_allowed_date(): void
    {
        Carbon::setTestNow('2026-10-09 10:00:00');

        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2025-01-01',
        ]);

        LeavePolicy::create([
            'user_id' => $user->id,
            'leave_type' => 'annual',
            'policy_type' => 'annual',
            'yearly_days' => 12,
            'waiting_period_months' => 0,
            'min_notice_days' => 5,
            'approval_levels' => 1,
            'is_active' => true,
        ]);

        $payload = [
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'start_date' => '2026-10-16', // Tepat H+5 hari kerja
            'end_date' => '2026-10-16',
            'reason' => 'Liburan',
            'status' => 'pending',
        ];

        $this->actingAs($user)
            ->post(route('hris.leaves.store'), $payload)
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertDatabaseCount('leave_requests', 1);
        $this->assertDatabaseHas('leave_requests', [
            'employee_id' => $employee->id,
            'start_date' => '2026-10-16 00:00:00',
        ]);
    }

    public function test_policy_stores_and_updates_min_notice_days(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)
            ->post(route('hris.leaves.policy.store'), [
                'leave_type' => 'annual',
                'policy_type' => 'annual',
                'yearly_days' => 12,
                'waiting_period_months' => 0,
                'max_days_per_request' => null,
                'min_notice_days' => 5,
                'approval_levels' => 1,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('leave_policies', [
            'user_id' => $user->id,
            'leave_type' => 'annual',
            'min_notice_days' => 5,
        ]);

        $policy = LeavePolicy::where('user_id', $user->id)->where('leave_type', 'annual')->firstOrFail();

        $this->actingAs($user)
            ->put(route('hris.leaves.policy.update', $policy), [
                'policy_type' => 'annual',
                'yearly_days' => 14,
                'waiting_period_months' => 1,
                'max_days_per_request' => 3,
                'min_notice_days' => 7,
                'approval_levels' => 2,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('leave_policies', [
            'id' => $policy->id,
            'min_notice_days' => 7,
            'yearly_days' => 14,
        ]);
    }
}
