<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceToleranceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_attendance_is_marked_late_after_shift_tolerance(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        WorkShift::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'code' => '0817',
            ],
            [
                'name' => 'Pagi',
                'start_time' => '08:00',
                'end_time' => '17:00',
                'is_day_off' => false,
                'late_tolerance_minutes' => 15,
            ],
        );

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-19',
            'shift_code' => '0817',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
        ]);

        $this->actingAs($user)
            ->post(route('hris.attendances.store'), [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-19',
                'status' => 'present',
                'check_in_at' => '2026-05-19 08:16:00',
            ])
            ->assertRedirect();

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', '2026-05-19')
            ->firstOrFail();

        $this->assertSame('late', $attendance->status);
    }

    public function test_admin_attendance_stores_tiered_lateness_after_shift_tolerance(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        WorkShift::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'code' => '0817',
            ],
            [
                'name' => 'Pagi',
                'start_time' => '08:00',
                'end_time' => '17:00',
                'is_day_off' => false,
                'late_tolerance_minutes' => 15,
            ],
        );

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-19',
            'shift_code' => '0817',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
        ]);

        $this->actingAs($user)
            ->post(route('hris.attendances.store'), [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-19',
                'status' => 'present',
                'check_in_at' => '2026-05-19 09:05:00',
            ])
            ->assertRedirect();

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', '2026-05-19')
            ->firstOrFail();

        $this->assertSame('late', $attendance->status);
        $this->assertSame(65, $attendance->late_minutes);
        $this->assertSame('level_3', $attendance->late_level);
    }

    public function test_admin_attendance_stays_present_at_tolerance_limit(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        WorkShift::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'code' => '0817',
            ],
            [
                'name' => 'Pagi',
                'start_time' => '08:00',
                'end_time' => '17:00',
                'is_day_off' => false,
                'late_tolerance_minutes' => 15,
            ],
        );

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-19',
            'shift_code' => '0817',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
        ]);

        $this->actingAs($user)
            ->post(route('hris.attendances.store'), [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-19',
                'status' => 'present',
                'check_in_at' => '2026-05-19 08:15:00',
            ])
            ->assertRedirect();

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', '2026-05-19')
            ->firstOrFail();

        $this->assertSame('present', $attendance->status);
        $this->assertNull($attendance->late_minutes);
        $this->assertNull($attendance->late_level);
    }

    public function test_admin_can_delete_employee_schedule_row(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);
        $schedule = EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-19',
            'shift_code' => '0817',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
        ]);

        $this->actingAs($user)
            ->delete(route('hris.schedules.destroy', $schedule))
            ->assertRedirect();

        $this->assertDatabaseMissing('employee_schedules', [
            'id' => $schedule->id,
        ]);
    }

    public function test_company_tiered_lateness_penalty_calculation(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'PT Test',
                'late_penalty_enabled' => true,
                'late_tolerance_minutes' => 15,
                'late_penalty_type' => 'tiered',
                'late_penalty_tiers' => [
                    ['from_minute' => 1, 'to_minute' => 15, 'penalty_amount' => 0, 'description' => 'Toleransi'],
                    ['from_minute' => 16, 'to_minute' => 30, 'penalty_amount' => 20000, 'description' => 'Terlambat 16-30 menit'],
                    ['from_minute' => 31, 'to_minute' => 60, 'penalty_amount' => 50000, 'description' => 'Terlambat 31-60 menit'],
                ],
            ]
        );

        WorkShift::query()->updateOrCreate(
            ['user_id' => $user->id, 'code' => '0918'],
            [
                'name' => 'Pagi 9',
                'start_time' => '09:00',
                'end_time' => '18:00',
                'is_day_off' => false,
                'late_tolerance_minutes' => 15,
            ]
        );

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-20',
            'shift_code' => '0918',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
        ]);

        // Check-in at 09:20 (20 min late -> tier 16-30 min -> Rp 20.000)
        $this->actingAs($user)
            ->post(route('hris.attendances.store'), [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-20',
                'status' => 'present',
                'check_in_at' => '2026-05-20 09:20:00',
            ])
            ->assertRedirect();

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', '2026-05-20')
            ->firstOrFail();

        $this->assertSame('late', $attendance->status);
        $this->assertSame(20, $attendance->late_minutes);
        $this->assertEquals(20000.00, (float) $attendance->late_penalty);
        $this->assertFalse((bool) $attendance->is_half_day);
    }

    public function test_company_progressive_lateness_penalty_calculation(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'PT Test',
                'late_penalty_enabled' => true,
                'late_tolerance_minutes' => 15,
                'late_penalty_type' => 'progressive',
                'late_base_penalty_minutes' => 15,
                'late_base_penalty_amount' => 10000,
                'late_incremental_penalty_amount' => 1000,
                'late_incremental_unit_minutes' => 1,
            ]
        );

        WorkShift::query()->updateOrCreate(
            ['user_id' => $user->id, 'code' => '0918'],
            [
                'name' => 'Pagi 9',
                'start_time' => '09:00',
                'end_time' => '18:00',
                'is_day_off' => false,
                'late_tolerance_minutes' => 15,
            ]
        );

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-21',
            'shift_code' => '0918',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
        ]);

        // Check-in at 09:25 (25 min late -> base 15m = 10k, extra 10m * 1k = 10k -> Total 20k)
        $this->actingAs($user)
            ->post(route('hris.attendances.store'), [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-21',
                'status' => 'present',
                'check_in_at' => '2026-05-21 09:25:00',
            ])
            ->assertRedirect();

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', '2026-05-21')
            ->firstOrFail();

        $this->assertSame('late', $attendance->status);
        $this->assertSame(25, $attendance->late_minutes);
        $this->assertEquals(20000.00, (float) $attendance->late_penalty);
    }

    public function test_company_max_lateness_half_day_leave_deduction_and_penalty(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2025-01-01',
        ]);

        \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'PT Test',
                'late_penalty_enabled' => true,
                'late_tolerance_minutes' => 15,
                'late_half_day_enabled' => true,
                'late_half_day_cutoff_minutes' => 60,
                'late_half_day_penalty_amount' => 75000,
                'late_half_day_deduct_leave' => true,
            ]
        );

        WorkShift::query()->updateOrCreate(
            ['user_id' => $user->id, 'code' => '0918'],
            [
                'name' => 'Pagi 9',
                'start_time' => '09:00',
                'end_time' => '18:00',
                'is_day_off' => false,
                'late_tolerance_minutes' => 15,
            ]
        );

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-22',
            'shift_code' => '0918',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
        ]);

        // Check-in at 10:15 (75 min late >= 60 min cutoff -> half day leave + Rp 75.000 penalty)
        $this->actingAs($user)
            ->post(route('hris.attendances.store'), [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-22',
                'status' => 'present',
                'check_in_at' => '2026-05-22 10:15:00',
            ])
            ->assertRedirect();

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', '2026-05-22')
            ->firstOrFail();

        $this->assertSame('late', $attendance->status);
        $this->assertSame(75, $attendance->late_minutes);
        $this->assertSame('half_day', $attendance->late_level);
        $this->assertTrue((bool) $attendance->is_half_day);
        $this->assertEquals(75000.00, (float) $attendance->late_penalty);

        $this->assertDatabaseHas('leave_requests', [
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'total_days' => 0.5,
            'status' => 'approved',
        ]);
    }

    public function test_attendance_settings_endpoint_saves_lateness_rules(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('settings.attendance.update'), [
                'missing_clock_out_request_days' => 3,
                'require_face_recognition' => true,
                'attendance_revision_cutoff_day' => '25',
                'late_penalty_enabled' => true,
                'late_tolerance_minutes' => 15,
                'late_penalty_type' => 'tiered',
                'late_penalty_tiers' => [
                    ['from_minute' => 1, 'to_minute' => 15, 'penalty_amount' => 0, 'description' => 'Toleransi'],
                    ['from_minute' => 16, 'to_minute' => 30, 'penalty_amount' => 25000, 'description' => '16-30m'],
                ],
                'late_half_day_enabled' => true,
                'late_half_day_cutoff_minutes' => 60,
                'late_half_day_penalty_amount' => 50000,
                'late_half_day_deduct_leave' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('company_settings', [
            'user_id' => $user->id,
            'late_penalty_enabled' => true,
            'late_tolerance_minutes' => 15,
            'late_penalty_type' => 'tiered',
            'late_half_day_enabled' => true,
            'late_half_day_cutoff_minutes' => 60,
        ]);
    }

    public function test_company_max_lateness_half_day_prorate_penalty_calculation(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 4_400_000,
        ]);

        \App\Models\EmployeeAllowance::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Jabatan',
            'amount' => 1_100_000,
            'is_active' => true,
            'effective_start_date' => '2026-01-01',
        ]);

        \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'PT Test',
                'active_working_days' => 22,
                'late_penalty_enabled' => true,
                'late_tolerance_minutes' => 15,
                'late_penalty_type' => 'tiered',
                'late_half_day_enabled' => true,
                'late_half_day_cutoff_minutes' => 60,
                'late_half_day_penalty_type' => 'prorate_half_day',
                'late_half_day_deduct_leave' => false,
            ]
        );

        WorkShift::query()->updateOrCreate(
            ['user_id' => $user->id, 'code' => '0918'],
            [
                'name' => 'Pagi 9',
                'start_time' => '09:00',
                'end_time' => '18:00',
                'is_day_off' => false,
                'late_tolerance_minutes' => 15,
            ]
        );

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-23',
            'shift_code' => '0918',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
        ]);

        // Check-in at 10:15 (75 min late > 60 cutoff -> half day prorate penalty)
        $this->actingAs($user)
            ->post(route('hris.attendances.store'), [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-23',
                'status' => 'present',
                'check_in_at' => '2026-05-23 10:15:00',
            ])
            ->assertRedirect();

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', '2026-05-23')
            ->firstOrFail();

        $this->assertSame('late', $attendance->status);
        $this->assertSame(75, $attendance->late_minutes);
        $this->assertSame('half_day', $attendance->late_level);
        $this->assertTrue((bool) $attendance->is_half_day);
        // 0.5 * (5.500.000 / 22) = 125.000
        $this->assertEquals(125000.00, (float) $attendance->late_penalty);
    }
}
