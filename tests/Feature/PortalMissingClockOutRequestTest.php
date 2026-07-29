<?php

namespace Tests\Feature;

use App\Models\CompanySetting;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class PortalMissingClockOutRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_portal_user_can_request_missing_clock_out_by_the_inclusive_deadline(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-07-03 09:00:00', 'Asia/Makassar'));

        try {
            [$portalUser] = $this->portalEmployeeWithMissingCheckout('2026-07-01');

            $this->actingAs($portalUser)
                ->withHeader('X-Timezone', 'Asia/Makassar')
                ->postJson(route('portal.api.attendance-requests.store'), [
                    'request_type' => 'missing_clock_out',
                    'attendance_date' => '2026-07-01',
                    'check_out_at' => '2026-07-01T18:00:00',
                    'reason' => 'Lupa clock out.',
                ])
                ->assertCreated()
                ->assertJsonPath('data.request_type', 'missing_clock_out');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_portal_user_cannot_request_missing_clock_out_after_effective_deadline(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-07-04 09:00:00', 'Asia/Makassar'));

        try {
            [$portalUser] = $this->portalEmployeeWithMissingCheckout('2026-07-01');

            $this->actingAs($portalUser)
                ->withHeader('X-Timezone', 'Asia/Makassar')
                ->postJson(route('portal.api.attendance-requests.store'), [
                    'request_type' => 'missing_clock_out',
                    'attendance_date' => '2026-07-01',
                    'check_out_at' => '2026-07-01T18:00:00',
                    'reason' => 'Lupa clock out.',
                ])
                ->assertUnprocessable();
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_portal_user_cannot_submit_clock_out_before_existing_clock_in(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-07-02 09:00:00', 'Asia/Makassar'));

        try {
            [$portalUser, $employee] = $this->portalEmployeeWithMissingCheckout('2026-07-01');
            EmployeeAttendance::query()
                ->where('employee_id', $employee->id)
                ->update(['check_in_at' => '2026-07-01 10:00:00']);

            $this->actingAs($portalUser)
                ->withHeader('X-Timezone', 'Asia/Makassar')
                ->postJson(route('portal.api.attendance-requests.store'), [
                    'request_type' => 'missing_clock_out',
                    'attendance_date' => '2026-07-01',
                    'check_out_at' => '2026-07-01T08:00:00',
                    'reason' => 'Lupa clock out.',
                ])
                ->assertUnprocessable();
        } finally {
            Carbon::setTestNow();
        }
    }

    /** @return array{0: User, 1: Employee} */
    private function portalEmployeeWithMissingCheckout(string $attendanceDate): array
    {
        $owner = User::factory()->create();
        $portalUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $owner->id,
            'email_verified_at' => now(),
        ]);
        $division = Division::factory()->create(['user_id' => $owner->id]);
        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => $portalUser->email,
            'employment_status' => 'active',
        ]);

        CompanySetting::query()->create([
            'user_id' => $owner->id,
            'name' => 'Humi',
            'missing_clock_out_request_days' => 2,
            'attendance_revision_cutoff_day' => 'end_of_month',
        ]);
        EmployeeAttendance::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'attendance_date' => $attendanceDate,
            'timezone' => 'Asia/Makassar',
            'status' => 'present',
            'check_in_at' => $attendanceDate.' 01:00:00',
            'check_out_at' => null,
        ]);

        return [$portalUser, $employee];
    }
}
