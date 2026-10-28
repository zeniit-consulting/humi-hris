<?php

namespace Tests\Feature\Hris;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\PayrollRun;
use App\Models\User;
use App\Models\WorkShift;
use App\Services\PayrollGenerationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DynamicWorkingDaysTest extends TestCase
{
    use RefreshDatabase;

    public function test_resolve_active_working_days_for_five_days_mode(): void
    {
        $setting = new CompanySetting([
            'working_days_type' => '5_days',
            'active_working_days' => 22,
        ]);

        // November 2026 has 21 weekdays (Mon-Fri)
        $start = Carbon::parse('2026-11-01');
        $end = Carbon::parse('2026-11-30');

        $this->assertSame(21, $setting->resolveActiveWorkingDays($start, $end));
    }

    public function test_resolve_active_working_days_for_six_days_mode(): void
    {
        $setting = new CompanySetting([
            'working_days_type' => '6_days',
            'active_working_days' => 22,
        ]);

        // November 2026 has 25 days (Mon-Sat, 30 days minus 5 Sundays)
        $start = Carbon::parse('2026-11-01');
        $end = Carbon::parse('2026-11-30');

        $this->assertSame(25, $setting->resolveActiveWorkingDays($start, $end));
    }

    public function test_resolve_active_working_days_for_shift_count_mode(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create(['user_id' => $user->id]);

        $setting = new CompanySetting([
            'user_id' => $user->id,
            'working_days_type' => 'shift_count',
            'active_working_days' => 22,
        ]);

        $start = Carbon::parse('2026-11-01');
        $end = Carbon::parse('2026-11-30');

        // Create 18 active shifts and 4 off days
        for ($i = 1; $i <= 18; $i++) {
            EmployeeSchedule::create([
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'shift_name' => 'Shift Normal',
                'shift_code' => 'NORMAL',
                'work_date' => Carbon::parse(sprintf('2026-11-%02d', $i)),
                'is_day_off' => false,
            ]);
        }
        for ($i = 19; $i <= 22; $i++) {
            EmployeeSchedule::create([
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'shift_name' => 'Libur',
                'shift_code' => 'OFF',
                'work_date' => Carbon::parse(sprintf('2026-11-%02d', $i)),
                'is_day_off' => true,
            ]);
        }

        $this->assertSame(18, $setting->resolveActiveWorkingDays($start, $end, $employee));

        // When employee has 0 shifts, fallback to active_working_days
        $otherEmployee = Employee::factory()->create(['user_id' => $user->id]);
        $this->assertSame(22, $setting->resolveActiveWorkingDays($start, $end, $otherEmployee));
    }

    public function test_payroll_generation_applies_dynamic_working_days_to_unpaid_leave_deduction(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 6300000,
            'employment_type' => 'PKWT',
            'hire_date' => '2025-01-01',
        ]);

        // Setting 5_days: November 2026 has 21 days
        $setting = CompanySetting::create([
            'user_id' => $user->id,
            'name' => 'Test Company',
            'active_working_days' => 22,
            'working_days_type' => '5_days',
            'payroll_cutoff_day' => 'end_of_month',
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        // 1 day unpaid leave in November 2026
        LeaveRequest::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'unpaid',
            'start_date' => '2026-11-05',
            'end_date' => '2026-11-05',
            'total_days' => 1,
            'reason' => 'Unpaid leave',
            'status' => 'approved',
        ]);

        $service = app(PayrollGenerationService::class);
        $run5Days = $service->generateForPeriod($user->id, '2026-11', $user->id);
        $item5Days = $run5Days->items()->where('employee_id', $employee->id)->firstOrFail();

        // Daily rate with 5_days (21 days) = 6,300,000 / 21 = 300,000
        // If fixed 22 days, it would be 6,300,000 / 22 = 286,363.64
        $this->assertEquals(300000.0, (float) $item5Days->unpaid_leave_deduction);

        // Now change setting to 6_days: November 2026 has 25 days
        $setting->update(['working_days_type' => '6_days']);
        $run5Days->delete();

        $run6Days = $service->generateForPeriod($user->id, '2026-11', $user->id);
        $item6Days = $run6Days->items()->where('employee_id', $employee->id)->firstOrFail();

        // Daily rate with 6_days (25 days) = 6,300,000 / 25 = 252,000
        $this->assertEquals(252000.0, (float) $item6Days->unpaid_leave_deduction);
    }

    public function test_payroll_generation_applies_shift_count_mode_to_deductions(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 6000000,
            'employment_type' => 'PKWT',
            'hire_date' => '2025-01-01',
        ]);

        $setting = CompanySetting::create([
            'user_id' => $user->id,
            'name' => 'Test Company',
            'active_working_days' => 22,
            'working_days_type' => 'shift_count',
            'payroll_cutoff_day' => 'end_of_month',
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        // Assign 20 active shifts for November 2026
        for ($i = 1; $i <= 20; $i++) {
            EmployeeSchedule::create([
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'shift_name' => 'Shift Normal',
                'shift_code' => 'NORMAL',
                'work_date' => Carbon::parse(sprintf('2026-11-%02d', $i)),
                'is_day_off' => false,
            ]);
        }

        // 1 day unpaid leave
        LeaveRequest::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'unpaid',
            'start_date' => '2026-11-05',
            'end_date' => '2026-11-05',
            'total_days' => 1,
            'reason' => 'Unpaid leave',
            'status' => 'approved',
        ]);

        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($user->id, '2026-11', $user->id);
        $item = $run->items()->where('employee_id', $employee->id)->firstOrFail();

        // Daily rate = 6,000,000 / 20 shifts = 300,000
        $this->assertEquals(300000.0, (float) $item->unpaid_leave_deduction);
    }

    public function test_proration_calculates_actual_clock_ins_plus_sick_and_unpaid_leave_divided_by_working_days(): void
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 22000000,
            'employment_type' => 'PKWT',
            'hire_date' => '2026-11-10', // Mid-month new hire
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
        ]);

        $setting = CompanySetting::create([
            'user_id' => $user->id,
            'name' => 'Test Company',
            'active_working_days' => 22,
            'working_days_type' => 'fixed',
            'payroll_cutoff_day' => 'end_of_month',
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        // 12 attendance days with check_in_at
        for ($i = 10; $i <= 21; $i++) {
            \App\Models\EmployeeAttendance::create([
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'attendance_date' => sprintf('2026-11-%02d', $i),
                'status' => 'present',
                'check_in_at' => sprintf('2026-11-%02d 08:00:00', $i),
            ]);
        }

        // 4 days approved sick leave
        LeaveRequest::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'sick',
            'start_date' => '2026-11-22',
            'end_date' => '2026-11-25',
            'total_days' => 4,
            'reason' => 'Sakit demam',
            'status' => 'approved',
        ]);

        // 2 days approved unpaid leave
        LeaveRequest::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'unpaid',
            'start_date' => '2026-11-26',
            'end_date' => '2026-11-27',
            'total_days' => 2,
            'reason' => 'Keperluan keluarga',
            'status' => 'approved',
        ]);

        // Total active days: 12 present + 4 sick + 2 unpaid = 18 days!
        $service = app(PayrollGenerationService::class);
        $run = $service->generateForPeriod($user->id, '2026-11', $user->id);
        $item = $run->items()->where('employee_id', $employee->id)->firstOrFail();

        $this->assertTrue((bool) $item->is_prorated);
        $this->assertSame(22, $item->proration_working_days);
        $this->assertSame(18, $item->proration_payable_days);
        $this->assertEqualsWithDelta(18 / 22, (float) $item->proration_factor, 0.000001);

        // Prorated base salary: 22,000,000 * (18 / 22) = 18,000,000
        $this->assertEquals(18000000.0, (float) $item->base_salary);

        // Unpaid leave deduction for 2 days: (22,000,000 / 22) * 2 = 2,000,000
        $this->assertEquals(2000000.0, (float) $item->unpaid_leave_deduction);

        // Net salary: 18,000,000 - 2,000,000 = 16,000,000
        $this->assertEquals(16000000.0, (float) $item->net_salary);
    }
}
