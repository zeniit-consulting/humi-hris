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

        WorkShift::query()->create([
            'user_id' => $user->id,
            'code' => '0817',
            'name' => 'Pagi',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
            'late_tolerance_minutes' => 15,
        ]);

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

    public function test_admin_attendance_stays_present_at_tolerance_limit(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        WorkShift::query()->create([
            'user_id' => $user->id,
            'code' => '0817',
            'name' => 'Pagi',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
            'late_tolerance_minutes' => 15,
        ]);

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
}
