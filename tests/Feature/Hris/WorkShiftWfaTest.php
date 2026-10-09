<?php

namespace Tests\Feature\Hris;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use App\Models\User;
use App\Models\WorkShift;
use App\Services\AttendanceStatusService;
use App\Services\PayrollGenerationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class WorkShiftWfaTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_wfa_work_shift_and_it_generates_code_with_wfa_suffix(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->post(route('hris.schedules.shifts.store'), [
                'name' => 'WFA Fleksibel',
                'start_time' => '09:00',
                'end_time' => '18:00',
                'late_tolerance_minutes' => 15,
                'is_wfa' => true,
            ]);

        $response->assertRedirect();

        $shift = WorkShift::query()
            ->where('user_id', $admin->id)
            ->where('is_wfa', true)
            ->firstOrFail();

        $this->assertSame('0918-WFA', $shift->code);
        $this->assertSame('WFA Fleksibel', $shift->name);
        $this->assertTrue((bool) $shift->is_wfa);
    }

    public function test_admin_can_update_work_shift_wfa_flag(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Default shifts like 0817 are automatically seeded; find or create a custom one
        $shift = WorkShift::query()->firstOrCreate(
            [
                'user_id' => $admin->id,
                'code' => '0817',
            ],
            [
                'name' => 'Normal Shift',
                'start_time' => '08:00',
                'end_time' => '17:00',
                'is_day_off' => false,
                'is_wfa' => false,
                'late_tolerance_minutes' => 15,
            ]
        );

        $response = $this->actingAs($admin)
            ->put(route('hris.schedules.shifts.update', $shift), [
                'name' => 'Normal Shift (Sekarang WFA)',
                'start_time' => '08:00',
                'end_time' => '17:00',
                'late_tolerance_minutes' => 15,
                'is_wfa' => true,
            ]);

        $response->assertRedirect();

        $shift->refresh();
        $this->assertTrue((bool) $shift->is_wfa);
        $this->assertSame('Normal Shift (Sekarang WFA)', $shift->name);
    }

    public function test_assigning_employee_schedule_persists_is_wfa_flag(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_active' => true,
            'is_wfa' => false, // Employee profile is onsite by default
        ]);

        WorkShift::query()->create([
            'user_id' => $admin->id,
            'code' => '0918-WFA',
            'name' => 'WFA Shift',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
            'is_wfa' => true,
            'late_tolerance_minutes' => 15,
        ]);

        $response = $this->actingAs($admin)
            ->post(route('hris.schedules.store'), [
                'employee_id' => $employee->id,
                'month' => '2026-05',
                'entries' => [
                    [
                        'date' => '2026-05-15',
                        'shift_code' => '0918-WFA',
                        'notes' => 'Hari Jumat WFA',
                    ],
                ],
            ]);

        $response->assertRedirect();

        $schedule = EmployeeSchedule::query()
            ->where('employee_id', $employee->id)
            ->whereDate('work_date', '2026-05-15')
            ->firstOrFail();

        $this->assertSame('0918-WFA', $schedule->shift_code);
        $this->assertTrue((bool) $schedule->is_wfa);
        $this->assertSame('Hari Jumat WFA', $schedule->notes);
    }

    public function test_auto_mark_absent_command_marks_wfa_schedules_as_wfa_status_and_regular_as_absent(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $wfaEmployee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_active' => true,
            'employment_status' => 'active',
            'is_wfa' => false,
        ]);

        $onsiteEmployee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_active' => true,
            'employment_status' => 'active',
            'is_wfa' => false,
        ]);

        $testDate = '2026-05-15';

        // WFA Schedule for employee 1
        EmployeeSchedule::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $wfaEmployee->id,
            'work_date' => $testDate,
            'shift_code' => '0918-WFA',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
            'is_wfa' => true,
        ]);

        // Regular Onsite Schedule for employee 2
        EmployeeSchedule::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $onsiteEmployee->id,
            'work_date' => $testDate,
            'shift_code' => '0817',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
            'is_wfa' => false,
        ]);

        // Run auto-absent command for this date
        $this->artisan('attendance:auto-absent', ['--date' => $testDate])
            ->assertSuccessful();

        // WFA employee should have attendance with status 'wfa'
        $wfaAttendance = EmployeeAttendance::query()
            ->where('employee_id', $wfaEmployee->id)
            ->whereDate('attendance_date', $testDate)
            ->firstOrFail();

        $this->assertSame('wfa', $wfaAttendance->status);
        $this->assertStringContainsString('WFA', $wfaAttendance->notes);

        // Onsite employee should have attendance with status 'absent'
        $onsiteAttendance = EmployeeAttendance::query()
            ->where('employee_id', $onsiteEmployee->id)
            ->whereDate('attendance_date', $testDate)
            ->firstOrFail();

        $this->assertSame('absent', $onsiteAttendance->status);
        $this->assertStringContainsString('absen', $onsiteAttendance->notes);
    }

    public function test_attendance_status_service_skips_lateness_and_late_penalty_for_wfa_shift(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_active' => true,
            'is_wfa' => false,
        ]);

        $wfaShift = WorkShift::query()->create([
            'user_id' => $admin->id,
            'code' => '0918-WFA',
            'name' => 'WFA Shift',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
            'is_wfa' => true,
            'late_tolerance_minutes' => 15,
        ]);

        EmployeeSchedule::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-15',
            'shift_code' => '0918-WFA',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
            'is_wfa' => true,
        ]);

        /** @var AttendanceStatusService $service */
        $service = app(AttendanceStatusService::class);

        // Employee clocks in at 11:30 (2.5 hours late for normal shifts)
        $result = $service->resolveStatusAttributes([
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-15',
            'check_in_at' => '2026-05-15 11:30:00',
        ], $admin->id);

        $this->assertSame('present', $result['status']);
        $this->assertNull($result['late_minutes']);
        $this->assertSame(0.0, $result['late_penalty']);

        $attendance = new EmployeeAttendance([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'shift_id' => $wfaShift->id,
            'attendance_date' => '2026-05-15',
            'check_in_at' => '2026-05-15 11:30:00',
            'late_minutes' => 150,
        ]);

        $penalty = $service->calculateLatePenaltyForAttendance($attendance, null, $employee, $wfaShift);
        $this->assertSame(0.0, $penalty);
    }

    public function test_payroll_generation_does_not_deduct_unrecorded_attendance_for_wfa_shifts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $setting = CompanySetting::query()->create([
            'user_id' => $admin->id,
            'company_name' => 'PT Test',
            'unrecorded_cutoff_penalty_enabled' => true,
            'attendance_cutoff_penalty_amount' => 100000,
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_active' => true,
            'employment_status' => 'active',
            'base_salary' => 5000000,
            'is_wfa' => false,
        ]);

        // Schedule WFA on a past weekday Friday (e.g. 2026-01-09)
        EmployeeSchedule::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-01-09',
            'shift_code' => '0918-WFA',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
            'is_wfa' => true,
        ]);

        $employee->load(['schedules', 'attendances', 'leaveRequests']);

        /** @var PayrollGenerationService $service */
        $service = app(PayrollGenerationService::class);

        $method = new \ReflectionMethod(PayrollGenerationService::class, 'unrecordedAttendanceCutoffDates');
        $method->setAccessible(true);

        $periodStart = Carbon::parse('2026-01-01');
        $periodEnd = Carbon::parse('2026-01-31');

        $missingDates = $method->invoke($service, $employee, $periodStart, $periodEnd, $setting);

        // Since 2026-01-09 is a WFA schedule, it must NOT be marked as missing
        $this->assertNotContains('2026-01-09', $missingDates);
    }

    public function test_portal_attendance_policy_returns_wfa_mode_when_scheduled_for_wfa_shift_today(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $employee = Employee::factory()->create([
            'user_id' => $admin->id,
            'is_active' => true,
            'is_wfa' => false, // employee profile is onsite
        ]);

        $employeeUser = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $admin->id,
            'employee_id' => $employee->id,
        ]);

        $today = now()->toDateString();

        // Create WFA schedule for today
        EmployeeSchedule::query()->create([
            'user_id' => $admin->id,
            'employee_id' => $employee->id,
            'work_date' => $today,
            'shift_code' => '0918-WFA',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'is_day_off' => false,
            'is_wfa' => true,
        ]);

        $token = $employeeUser->createToken('test', ['mobile'])->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson(route('mobile.v1.portal.attendance-policy'));

        $response->assertOk()
            ->assertJsonPath('data.mode', 'wfa');

        // Location check should succeed regardless of coordinates
        $locResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson(route('mobile.v1.portal.attendance-location.check'), [
                'latitude' => -6.200000,
                'longitude' => 106.816666,
            ]);

        $locResponse->assertOk()
            ->assertJsonPath('data.mode', 'wfa')
            ->assertJsonPath('data.is_within_radius', true);
    }
}
