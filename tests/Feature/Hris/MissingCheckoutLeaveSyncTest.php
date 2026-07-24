<?php

namespace Tests\Feature\Hris;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeLeaveBalance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MissingCheckoutLeaveSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_deducts_annual_leave_for_a_missing_checkout_when_enabled(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        CompanySetting::query()->create([
            'user_id' => $user->id,
            'auto_deduct_leave_for_missing_checkout' => true,
        ]);
        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-02-10',
            'status' => 'present',
            'check_in_at' => '2026-02-10 08:00:00',
            'check_out_at' => null,
        ]);

        $this->actingAs($user)
            ->post(route('hris.attendances.sync-missing-checkouts'), ['date' => '2026-02-10'])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('employee_attendances', [
            'employee_id' => $employee->id,
            'attendance_date' => '2026-02-10 00:00:00',
        ]);
        $this->assertNotNull(EmployeeAttendance::query()->firstOrFail()->check_out_at);
        $this->assertSame(1.0, (float) EmployeeLeaveBalance::query()->firstOrFail()->used_days);
    }
}
