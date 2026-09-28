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

    public function test_company_max_lateness_half_day_prorate_penalty_works_even_when_general_late_penalty_disabled(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 6_000_000,
        ]);

        \App\Models\EmployeeAllowance::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Tetap',
            'amount' => 600_000,
            'is_active' => true,
            'effective_start_date' => '2026-01-01',
        ]);

        \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'PT Test 2',
                'active_working_days' => 22,
                'late_penalty_enabled' => false, // General tiered penalty disabled
                'late_tolerance_minutes' => 15,
                'late_half_day_enabled' => true, // Potong Prorata Harian enabled
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
            'work_date' => '2026-05-24',
            'shift_code' => '0918',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
        ]);

        // Check-in at 10:10 (70 min late > 60 cutoff -> half day prorate penalty)
        $this->actingAs($user)
            ->post(route('hris.attendances.store'), [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-24',
                'status' => 'present',
                'check_in_at' => '2026-05-24 10:10:00',
            ])
            ->assertRedirect();

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', '2026-05-24')
            ->firstOrFail();

        $this->assertSame('late', $attendance->status);
        $this->assertSame(70, $attendance->late_minutes);
        $this->assertSame('half_day', $attendance->late_level);
        $this->assertTrue((bool) $attendance->is_half_day);
        // 0.5 * ((6.000.000 + 600.000) / 22) = 0.5 * (6.600.000 / 22) = 0.5 * 300.000 = 150.000
        $this->assertEquals(150000.00, (float) $attendance->late_penalty);
    }

    public function test_admin_can_sync_lateness_for_existing_attendances(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'Test Company',
                'late_tolerance_minutes' => 15,
                'late_penalty_enabled' => true,
                'late_penalty_type' => 'tiered',
                'late_penalty_tiers' => [
                    ['from_minute' => 1, 'to_minute' => 15, 'penalty_amount' => 0],
                    ['from_minute' => 16, 'to_minute' => 30, 'penalty_amount' => 25000],
                    ['from_minute' => 31, 'to_minute' => 60, 'penalty_amount' => 50000],
                ],
            ]
        );

        $shift = WorkShift::query()->create([
            'user_id' => $user->id,
            'name' => 'Shift Normal',
            'code' => 'NORM',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
            'late_tolerance_minutes' => 15,
        ]);

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-06-01',
            'shift_code' => 'NORM',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
        ]);

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-06-02',
            'shift_code' => 'NORM',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
        ]);

        // Record 1: Check-in at 08:25 (25 min late), but mistakenly recorded as present with no late info
        $att1 = EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => '2026-06-01',
            'status' => 'present',
            'check_in_at' => '2026-06-01 08:25:00',
            'late_minutes' => null,
            'late_penalty' => 0,
        ]);

        // Record 2: Check-in at 08:10 (on time, within 15 min tolerance), but was recorded as late with old penalty
        $att2 = EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => '2026-06-02',
            'status' => 'late',
            'check_in_at' => '2026-06-02 08:10:00',
            'late_minutes' => 10,
            'late_penalty' => 20000,
        ]);

        $this->actingAs($user)
            ->post(route('hris.attendances.sync-lateness'), [
                'start_date' => '2026-06-01',
                'end_date' => '2026-06-02',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $att1->refresh();
        $att2->refresh();

        // att1 should now be late with 25 minutes and 25.000 penalty
        $this->assertSame('late', $att1->status);
        $this->assertSame(25, $att1->late_minutes);
        $this->assertSame('level_1', $att1->late_level);
        $this->assertEquals(25000.00, (float) $att1->late_penalty);

        // att2 should now be present (on time) with null late minutes and 0 penalty
        $this->assertSame('present', $att2->status);
        $this->assertNull($att2->late_minutes);
        $this->assertNull($att2->late_level);
        $this->assertEquals(0.00, (float) $att2->late_penalty);
    }

    public function test_admin_can_sync_lateness_from_attendance_settings(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'Test Company',
                'late_tolerance_minutes' => 10,
                'late_penalty_enabled' => true,
                'late_penalty_type' => 'tiered',
                'late_penalty_tiers' => [
                    ['from_minute' => 1, 'to_minute' => 10, 'penalty_amount' => 0],
                    ['from_minute' => 11, 'to_minute' => 30, 'penalty_amount' => 30000],
                ],
            ]
        );

        WorkShift::query()->create([
            'user_id' => $user->id,
            'name' => 'Shift Pagi',
            'code' => 'PAGI',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
            'late_tolerance_minutes' => 10,
        ]);

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-07-01',
            'shift_code' => 'PAGI',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
        ]);

        $att = EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-07-01',
            'status' => 'present',
            'check_in_at' => '2026-07-01 08:20:00',
        ]);

        $this->actingAs($user)
            ->post(route('settings.attendance.sync-lateness'))
            ->assertRedirect(route('settings.attendance.edit'))
            ->assertSessionHas('success');

        $att->refresh();
        $this->assertSame('late', $att->status);
        $this->assertSame(20, $att->late_minutes);
        $this->assertEquals(30000.00, (float) $att->late_penalty);
    }

    public function test_tiered_penalty_properly_charges_zero_for_tolerance_tier(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $setting = \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'PT Test',
                'late_penalty_enabled' => true,
                'late_tolerance_minutes' => 0,
                'late_penalty_type' => 'tiered',
                'late_penalty_tiers' => [
                    ['from_minute' => 1, 'to_minute' => 15, 'penalty_amount' => 0, 'description' => 'Toleransi'],
                    ['from_minute' => 16, 'to_minute' => 30, 'penalty_amount' => 20000, 'description' => 'Terlambat 16-30 menit'],
                    ['from_minute' => 31, 'to_minute' => 60, 'penalty_amount' => 50000, 'description' => 'Terlambat 31-60 menit'],
                ],
            ]
        );

        $service = app(\App\Services\AttendanceStatusService::class);

        // 10 minutes late matches tier 1 (amount 0) -> must return 0.0, NOT highest tier 50000
        $penalty = $service->calculateLatePenalty(10, false, $setting, $employee);
        $this->assertSame(0.0, $penalty);

        // 20 minutes late matches tier 2 (amount 20000)
        $penalty20 = $service->calculateLatePenalty(20, false, $setting, $employee);
        $this->assertEquals(20000.0, $penalty20);

        // 40 minutes late matches tier 3 (amount 50000)
        $penalty40 = $service->calculateLatePenalty(40, false, $setting, $employee);
        $this->assertEquals(50000.0, $penalty40);

        // Attendance record test
        $att = EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-07-02',
            'status' => 'late',
            'late_minutes' => 10,
            'late_penalty' => 50000.0, // previous incorrect penalty
        ]);

        $finalPenalty = $service->calculateLatePenaltyForAttendance($att, $setting, $employee, syncAttendanceRecord: true);
        $this->assertSame(0.0, $finalPenalty);
        $att->refresh();
        $this->assertEquals(0.0, (float) $att->late_penalty);
    }

    public function test_tiered_penalty_properly_charges_zero_when_below_lowest_tier(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $setting = \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'PT Test',
                'late_penalty_enabled' => true,
                'late_penalty_type' => 'tiered',
                'late_penalty_tiers' => [
                    ['from_minute' => 16, 'to_minute' => 30, 'penalty_amount' => 20000, 'description' => 'Terlambat 16-30 menit'],
                    ['from_minute' => 31, 'to_minute' => 60, 'penalty_amount' => 50000, 'description' => 'Terlambat 31-60 menit'],
                ],
            ]
        );

        $service = app(\App\Services\AttendanceStatusService::class);

        // 10 minutes late is below 16 -> should be 0.0, NOT highest tier
        $penalty = $service->calculateLatePenalty(10, false, $setting, $employee);
        $this->assertSame(0.0, $penalty);
    }

    public function test_tiered_penalty_caps_at_highest_tier_when_exceeding_max_tier(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $setting = \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'PT Test',
                'late_penalty_enabled' => true,
                'late_penalty_type' => 'tiered',
                'late_penalty_tiers' => [
                    ['from_minute' => 1, 'to_minute' => 15, 'penalty_amount' => 0],
                    ['from_minute' => 16, 'to_minute' => 30, 'penalty_amount' => 20000],
                    ['from_minute' => 31, 'to_minute' => 60, 'penalty_amount' => 50000],
                ],
            ]
        );

        $service = app(\App\Services\AttendanceStatusService::class);

        // 85 minutes late exceeds 60 -> capped at 50000
        $penalty = $service->calculateLatePenalty(85, false, $setting, $employee);
        $this->assertEquals(50000.0, $penalty);
    }

    public function test_admin_attendance_index_can_sort_by_attendance_date(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-07-01',
            'status' => 'present',
        ]);
        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-07-02',
            'status' => 'present',
        ]);

        $response = $this->actingAs($user)->get(route('hris.attendances.index', [
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-02',
            'sort_by' => 'attendance_date',
            'sort_dir' => 'desc',
        ]));

        $response->assertOk();
    }
}

