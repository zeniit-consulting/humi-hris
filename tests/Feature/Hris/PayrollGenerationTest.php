<?php

namespace Tests\Feature\Hris;

use App\Jobs\SendPayslipToWhatsApp;
use App\Models\Employee;
use App\Models\EmployeeAllowance;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeBankAccount;
use App\Models\EmployeeDeduction;
use App\Models\CompanySetting;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\SubCompany;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PayrollGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_users_can_open_payroll_page()
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)->get(route('hris.payrolls.index'))->assertOk();
    }

    public function test_payroll_can_be_auto_generated_from_salary_allowances_and_deductions()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 5_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 50_500,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        EmployeeAllowance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Tetap',
            'name' => 'Tunjangan Transport',
            'amount' => 500_000,
            'is_active' => true,
            'effective_start_date' => '2026-02-01',
            'effective_end_date' => null,
        ]);

        EmployeeAllowance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Makan',
            'amount' => 300_000,
            'is_active' => true,
            'effective_start_date' => '2026-01-01',
            'effective_end_date' => null,
        ]);

        EmployeeDeduction::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'type' => 'kasbon',
            'amount' => 250_000,
            'deduction_date' => '2026-02-10',
        ]);

        EmployeeDeduction::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'type' => 'denda',
            'amount' => 50_000,
            'deduction_date' => '2026-02-15',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_runs', [
            'period' => '2026-02',
            'employees_count' => 1,
            'total_base_salary' => 5000000.00,
            'total_allowances' => 800000.00,
            'total_deductions' => 350500.00,
            'total_net_salary' => 5449500.00,
        ]);

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'base_salary' => 5000000.00,
            'allowances_total' => 800000.00,
            'pph21_method' => 'gross',
            'pph21_rate' => 50500.00,
            'pph21_deduction' => 50500.00,
            'kasbon_deduction' => 250000.00,
            'denda_deduction' => 50000.00,
            'deductions_total' => 350500.00,
            'net_salary' => 5449500.00,
        ]);
    }

    public function test_service_fee_is_distributed_by_employee_points(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $senior = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 5_000_000,
            'service_fee_points' => 3,
            'pph21_rate' => 0,
        ]);
        $junior = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 4_000_000,
            'service_fee_points' => 1,
            'pph21_rate' => 0,
        ]);

        $this->actingAs($user)->post(route('hris.payrolls.generate'), [
            'period' => '2026-02',
            'service_fee_total' => 1_000_000,
        ])->assertRedirect();

        $this->assertDatabaseHas('payroll_runs', [
            'user_id' => $user->id,
            'period' => '2026-02',
            'service_fee_total' => 1_000_000,
        ]);
        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $senior->id,
            'allowances_total' => 750_000,
            'net_salary' => 5_750_000,
        ]);
        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $junior->id,
            'allowances_total' => 250_000,
            'net_salary' => 4_250_000,
        ]);
    }

    public function test_resigned_employee_receives_prorated_salary_in_their_final_month(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2025-01-01',
            'offboarded_at' => '2026-02-13',
            'base_salary' => 6_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => false,
            'employment_status' => 'resigned',
        ]);

        EmployeeAllowance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Tetap',
            'amount' => 600_000,
            'is_active' => true,
            'effective_start_date' => '2025-01-01',
            'effective_end_date' => null,
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_runs', [
            'user_id' => $user->id,
            'period' => '2026-02',
            'employees_count' => 1,
            'total_base_salary' => 3_000_000,
            'total_allowances' => 300_000,
            'total_net_salary' => 3_300_000,
        ]);

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'base_salary' => 3_000_000,
            'allowances_total' => 300_000,
            'net_salary' => 3_300_000,
            'is_prorated' => true,
            'proration_working_days' => 20,
            'proration_payable_days' => 10,
            'proration_factor' => 0.5,
        ]);
    }

    public function test_pph21_gross_up_adds_tax_allowance_and_equal_tax_deduction(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 4_000_000,
            'pph21_method' => 'gross_up',
            'pph21_rate' => 5,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'pph21_method' => 'gross_up',
            'pph21_allowance' => 5.00,
            'pph21_deduction' => 5.00,
            'net_salary' => 4000000.00,
        ]);
    }

    public function test_payroll_can_be_generated_for_parent_company_employees_only(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subCompany = SubCompany::query()->create([
            'user_id' => $user->id,
            'code' => 'CLIENT-A',
            'name' => 'Client A',
            'is_active' => true,
        ]);

        $parentEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => null,
            'base_salary' => 5_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $subCompanyEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => $subCompany->id,
            'base_salary' => 4_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
                'employee_scope' => 'parent_only',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_runs', [
            'period' => '2026-02',
            'employees_count' => 1,
            'total_base_salary' => 5000000.00,
            'total_net_salary' => 5000000.00,
        ]);

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $parentEmployee->id,
            'base_salary' => 5000000.00,
            'net_salary' => 5000000.00,
        ]);

        $this->assertDatabaseMissing('payroll_items', [
            'employee_id' => $subCompanyEmployee->id,
        ]);
    }

    public function test_payroll_generate_can_exclude_specific_employees(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $includedEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 5_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $excludedEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 4_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
                'excluded_employee_ids' => [$excludedEmployee->id],
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_runs', [
            'period' => '2026-02',
            'employees_count' => 1,
            'total_base_salary' => 5000000.00,
            'total_net_salary' => 5000000.00,
        ]);

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $includedEmployee->id,
            'base_salary' => 5000000.00,
            'net_salary' => 5000000.00,
        ]);

        $this->assertDatabaseMissing('payroll_items', [
            'employee_id' => $excludedEmployee->id,
        ]);
    }

    public function test_pph21_gross_up_matches_konsulin_dio_payroll_baseline(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Dio Restu Saputra',
            'last_name' => null,
            'hire_date' => '2026-01-01',
            'base_salary' => 6_500_000,
            'pph21_method' => 'gross_up',
            'pph21_rate' => 84_250,
            'ptkp_category' => 'K/1',
            'is_active' => true,
            'employment_status' => 'active',
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        EmployeeAllowance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Jabatan',
            'amount' => 500_000,
            'is_active' => true,
            'effective_start_date' => '2026-04-01',
        ]);

        EmployeeAllowance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Kinerja',
            'amount' => 300_000,
            'is_active' => true,
            'effective_start_date' => '2026-04-01',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-04',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-04', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'base_salary' => 6500000.00,
            'allowances_total' => 800000.00,
            'pph21_method' => 'gross_up',
            'pph21_rate' => 84250.00,
            'pph21_allowance' => 84250.00,
            'pph21_deduction' => 84250.00,
            'deductions_total' => 84250.00,
            'net_salary' => 7300000.00,
        ]);
    }

    public function test_pph21_gross_up_uses_minimum_floor_rupiah_tax_allowance(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'first_name' => 'Anisha Taniawati',
            'last_name' => null,
            'base_salary' => 12_000_000,
            'pph21_method' => 'gross_up',
            'pph21_rate' => 850_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        EmployeeAllowance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Jabatan',
            'amount' => 1_000_000,
            'is_active' => true,
            'effective_start_date' => '2026-04-01',
        ]);

        EmployeeAllowance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Kinerja',
            'amount' => 1_000_000,
            'is_active' => true,
            'effective_start_date' => '2026-04-01',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-04',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-04', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'pph21_method' => 'gross_up',
            'pph21_rate' => 850000.00,
            'pph21_allowance' => 850000.00,
            'pph21_deduction' => 850000.00,
            'net_salary' => 14000000.00,
        ]);
    }

    public function test_pph21_net_is_company_borne_and_not_cut_from_take_home_pay(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2026-01-01',
            'base_salary' => 4_000_000,
            'pph21_method' => 'net',
            'pph21_rate' => 200_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'pph21_method' => 'net',
            'pph21_company_borne' => 200000.00,
            'pph21_deduction' => 0.00,
            'net_salary' => 4000000.00,
        ]);
    }

    public function test_pph21_ter_harian_calculates_daily_tax_based_on_attendance(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 3_000_000,
            'pph21_method' => 'ter_harian',
            'pph21_rate' => 60_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-02-03',
            'status' => 'present',
        ]);

        EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-02-04',
            'status' => 'late',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'pph21_method' => 'ter_harian',
            'pph21_deduction' => 60000.00,
            'deductions_total' => 60000.00,
            'net_salary' => 2940000.00,
        ]);
    }

    public function test_daily_worker_payroll_uses_paid_attendance_days_and_daily_wage(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employment_type' => 'DW',
            'base_salary' => 0,
            'daily_wage' => 150_000,
            'hire_date' => '2026-01-01',
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
        ]);

        foreach (['2026-02-03' => 'present', '2026-02-04' => 'late', '2026-02-05' => 'absent'] as $date => $status) {
            EmployeeAttendance::factory()->create([
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'attendance_date' => $date,
                'status' => $status,
            ]);
        }

        $this->actingAs($user)->post(route('hris.payrolls.generate'), ['period' => '2026-02']);

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'base_salary' => 300000.00,
            'net_salary' => 300000.00,
        ]);
    }

    public function test_overtime_threshold_mode_pays_eight_hours_for_each_completed_threshold(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        CompanySetting::query()->create([
            'user_id' => $user->id,
            'overtime_calculation_mode' => 'threshold_daily',
            'overtime_threshold_hours' => 10,
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 1_730_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
        ]);
        OvertimeRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-02-03',
            'total_hours' => 10,
            'status' => 'approved',
        ]);

        $this->actingAs($user)->post(route('hris.payrolls.generate'), ['period' => '2026-02']);

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'overtime_hours' => 8.00,
            'overtime_pay' => 155000.00,
        ]);
    }

    public function test_approved_unpaid_leave_deducts_daily_base_salary_and_fixed_allowances(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        CompanySetting::query()->create([
            'user_id' => $user->id,
            'active_working_days' => 22,
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 4_400_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
        ]);
        EmployeeAllowance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Tetap',
            'amount' => 2_200_000,
            'is_active' => true,
        ]);
        LeaveRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'unpaid',
            'status' => 'approved',
            'start_date' => '2026-02-10',
            'end_date' => '2026-02-11',
            'total_days' => 2,
        ]);

        $this->actingAs($user)->post(route('hris.payrolls.generate'), ['period' => '2026-02']);

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'unpaid_leave_deduction' => 600000.00,
            'deductions_total' => 600000.00,
            'net_salary' => 6000000.00,
        ]);
    }

    public function test_generated_payroll_can_be_saved()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-02',
            'is_saved' => false,
            'saved_at' => null,
            'saved_by' => null,
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.save', $run))
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_runs', [
            'id' => $run->id,
            'is_saved' => true,
            'saved_by' => $user->id,
        ]);
    }

    public function test_generated_payroll_item_can_be_edited_before_saved(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 5_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ]);

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-02')->firstOrFail();
        $item = PayrollItem::query()->where('payroll_run_id', $run->id)->where('employee_id', $employee->id)->firstOrFail();

        $this->actingAs($user)
            ->put(route('hris.payrolls.items.update', [$run, $item]), [
                'base_salary' => '4.500.000',
                'allowances_total' => '750.000',
                'overtime_pay' => '250.000',
                'pph21_deduction' => '100.000',
                'kasbon_deduction' => '200.000',
                'denda_deduction' => '50.000',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseHas('payroll_items', [
            'id' => $item->id,
            'base_salary' => 4500000.00,
            'allowances_total' => 750000.00,
            'overtime_pay' => 250000.00,
            'pph21_deduction' => 100000.00,
            'kasbon_deduction' => 200000.00,
            'denda_deduction' => 50000.00,
            'deductions_total' => 350000.00,
            'net_salary' => 5150000.00,
        ]);

        $this->assertDatabaseHas('payroll_runs', [
            'id' => $run->id,
            'employees_count' => 1,
            'total_base_salary' => 4500000.00,
            'total_allowances' => 750000.00,
            'total_deductions' => 350000.00,
            'total_net_salary' => 5150000.00,
        ]);
    }

    public function test_draft_payroll_accepts_variable_allowances_and_bonuses(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2025-01-01',
            'base_salary' => 5_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)->post(route('hris.payrolls.generate'), [
            'period' => '2026-02',
        ]);

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-02')->firstOrFail();
        $item = PayrollItem::query()->where('payroll_run_id', $run->id)->where('employee_id', $employee->id)->firstOrFail();

        $this->actingAs($user)
            ->put(route('hris.payrolls.items.update', [$run, $item]), [
                'variable_allowances' => [
                    ['name' => 'Uang Makan Kehadiran', 'amount' => '500.000'],
                    ['name' => 'Insentif Shift', 'amount' => '250.000'],
                ],
                'bonuses' => [
                    ['name' => 'Bonus Target', 'amount' => '1.000.000'],
                ],
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']))
            ->assertSessionHasNoErrors();

        $item->refresh();

        $this->assertSame('1750000.00', $item->allowances_total);
        $this->assertSame('6750000.00', $item->net_salary);
        $this->assertSame([
            'Uang Makan Kehadiran' => 500_000,
            'Insentif Shift' => 250_000,
        ], $item->variable_allowance_breakdown);
        $this->assertSame(['Bonus Target' => 1_000_000], $item->bonus_breakdown);
    }

    public function test_draft_payroll_accepts_manual_deductions_and_updates_net_salary(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2025-01-01',
            'base_salary' => 5_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)->post(route('hris.payrolls.generate'), [
            'period' => '2026-02',
        ]);

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-02')->firstOrFail();
        $item = PayrollItem::query()->where('payroll_run_id', $run->id)->where('employee_id', $employee->id)->firstOrFail();

        $this->actingAs($user)
            ->put(route('hris.payrolls.items.update', [$run, $item]), [
                'manual_deductions' => [
                    ['name' => 'Potongan Koperasi', 'amount' => '150.000'],
                    ['name' => 'Potongan Inventaris', 'amount' => '50.000'],
                ],
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']))
            ->assertSessionHasNoErrors();

        $item->refresh();

        $this->assertSame('200000.00', $item->manual_deduction_total);
        $this->assertSame([
            'Potongan Koperasi' => 150_000,
            'Potongan Inventaris' => 50_000,
        ], $item->manual_deduction_breakdown);
        $this->assertSame('200000.00', $item->deductions_total);
        $this->assertSame('4800000.00', $item->net_salary);
    }

    public function test_saved_payroll_item_cannot_be_edited(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-02',
            'is_saved' => true,
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $item = PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 5_000_000,
            'allowances_total' => 0,
            'deductions_total' => 0,
            'net_salary' => 5_000_000,
            'allowance_breakdown' => [],
        ]);

        $this->actingAs($user)
            ->put(route('hris.payrolls.items.update', [$run, $item]), [
                'base_salary' => '4.000.000',
            ])
            ->assertSessionHas('error', 'Payroll yang sudah disimpan tidak bisa diedit.');

        $this->assertDatabaseHas('payroll_items', [
            'id' => $item->id,
            'base_salary' => 5000000.00,
        ]);
    }

    public function test_saved_payroll_can_be_recalculated_from_artisan_command(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2026-01-01',
            'base_salary' => 5_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 12_500,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-02',
            'is_saved' => true,
            'saved_at' => now(),
            'saved_by' => $user->id,
            'employees_count' => 1,
            'total_base_salary' => 1,
            'total_allowances' => 1,
            'total_deductions' => 1,
            'total_net_salary' => 1,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 1,
            'allowances_total' => 1,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'pph21_allowance' => 0,
            'pph21_deduction' => 0,
            'pph21_company_borne' => 0,
            'kasbon_deduction' => 0,
            'denda_deduction' => 0,
            'deductions_total' => 0,
            'net_salary' => 1,
            'allowance_breakdown' => [],
        ]);

        $this->artisan('payroll:recalculate', ['runId' => $run->id])
            ->assertSuccessful();

        $this->assertDatabaseHas('payroll_runs', [
            'id' => $run->id,
            'is_saved' => true,
            'employees_count' => 1,
            'total_base_salary' => 5000000.00,
            'total_deductions' => 12500.00,
            'total_net_salary' => 4987500.00,
        ]);

        $this->assertDatabaseHas('payroll_items', [
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 5000000.00,
            'pph21_deduction' => 12500.00,
            'deductions_total' => 12500.00,
            'net_salary' => 4987500.00,
        ]);
    }

    public function test_saved_payroll_payslips_can_be_queued_for_employee_whatsapp(): void
    {
        Queue::fake();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-02',
            'period_start' => '2026-02-01',
            'period_end' => '2026-02-28',
            'is_saved' => true,
            'saved_at' => now(),
            'saved_by' => $user->id,
        ]);

        $items = collect(range(1, 11))->map(function (int $number) use ($run, $user): PayrollItem {
            $employee = Employee::factory()->create([
                'user_id' => $user->id,
                'employee_code' => 'EMP-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT),
                'phone' => '0812345678'.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
            ]);

            return PayrollItem::query()->create([
                'user_id' => $user->id,
                'payroll_run_id' => $run->id,
                'employee_id' => $employee->id,
                'base_salary' => 5_000_000,
                'allowances_total' => 500_000,
                'pph21_method' => 'gross',
                'pph21_rate' => 5,
                'pph21_allowance' => 0,
                'pph21_deduction' => 100_000,
                'pph21_company_borne' => 0,
                'kasbon_deduction' => 0,
                'denda_deduction' => 0,
                'deductions_total' => 100_000,
                'net_salary' => 5_400_000,
                'allowance_breakdown' => ['Transport' => 500_000],
            ]);
        });

        $this->actingAs($user)
            ->post(route('hris.payrolls.send-payslips', $run))
            ->assertRedirect()
            ->assertSessionHas('success', 'Payslip masuk queue untuk 11 karyawan. 0 dilewati karena nomor WhatsApp tidak valid.');

        Queue::assertPushed(SendPayslipToWhatsApp::class, 11);
        Queue::assertPushed(SendPayslipToWhatsApp::class, function (SendPayslipToWhatsApp $job) use ($items, $user): bool {
            return $job->payrollItemId === $items->last()->id
                && $job->ownerId === $user->id
                && $job->delay !== null
                && now()->diffInSeconds($job->delay, false) >= 55;
        });
    }

    public function test_single_employee_payslip_can_be_queued_for_whatsapp(): void
    {
        Queue::fake();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'phone' => '081234567890',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-02',
            'is_saved' => true,
        ]);

        $item = PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 5_000_000,
            'allowances_total' => 500_000,
            'deductions_total' => 100_000,
            'net_salary' => 5_400_000,
            'allowance_breakdown' => [],
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.items.send-payslip', [$run, $item]))
            ->assertRedirect()
            ->assertSessionHas('success', 'Payslip karyawan masuk queue pengiriman WhatsApp.');

        Queue::assertPushed(SendPayslipToWhatsApp::class, function (SendPayslipToWhatsApp $job) use ($item, $user): bool {
            return $job->payrollItemId === $item->id
                && $job->ownerId === $user->id;
        });
    }

    public function test_unsaved_payroll_payslips_cannot_be_sent_to_whatsapp(): void
    {
        Queue::fake();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-02',
            'is_saved' => false,
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.send-payslips', $run))
            ->assertRedirect()
            ->assertSessionHas('error', 'Simpan payroll terlebih dahulu sebelum mengirim payslip ke WhatsApp.');

        Queue::assertNothingPushed();
    }

    public function test_two_companies_can_generate_payroll_for_the_same_period(): void
    {
        $firstUser = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $secondUser = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        Employee::factory()->create([
            'user_id' => $firstUser->id,
            'hire_date' => '2025-01-01',
            'base_salary' => 4_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        Employee::factory()->create([
            'user_id' => $secondUser->id,
            'hire_date' => '2025-01-01',
            'base_salary' => 4_500_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($firstUser)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->actingAs($secondUser)
            ->post(route('hris.payrolls.generate'), [
                'period' => '2026-02',
            ])
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']));

        $this->assertDatabaseCount('payroll_runs', 2);
        $this->assertDatabaseHas('payroll_runs', [
            'user_id' => $firstUser->id,
            'period' => '2026-02',
            'employees_count' => 1,
            'total_base_salary' => 4000000.00,
        ]);
        $this->assertDatabaseHas('payroll_runs', [
            'user_id' => $secondUser->id,
            'period' => '2026-02',
            'employees_count' => 1,
            'total_base_salary' => 4500000.00,
        ]);
    }

    public function test_payroll_page_exposes_readiness_checklist_for_draft_run(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $completeEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 5_000_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        EmployeeBankAccount::factory()->create([
            'employee_id' => $completeEmployee->id,
            'is_primary' => true,
        ]);

        $missingBankEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 4_000_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        LeaveRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $missingBankEmployee->id,
            'status' => 'pending',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-02',
            'type' => 'regular',
            'is_saved' => false,
            'employees_count' => 1,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $completeEmployee->id,
            'base_salary' => 5000000,
            'allowances_total' => 0,
            'deductions_total' => 0,
            'net_salary' => 5000000,
            'allowance_breakdown' => [],
        ]);

        $this->actingAs($user)
            ->get(route('hris.payrolls.index', ['period' => '2026-02']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('payrollReadiness.period', '2026-02')
                ->where('payrollReadiness.status', 'warning')
                ->where('payrollReadiness.warning_count', 2)
                ->where('payrollReadiness.checks.0.key', 'active_employees_included')
                ->where('payrollReadiness.checks.0.complete', false)
                ->where('payrollReadiness.checks.1.key', 'bank_accounts')
                ->where('payrollReadiness.checks.1.complete', false)
                ->where('payrollReadiness.checks.2.key', 'resigned_excluded')
                ->where('payrollReadiness.checks.2.complete', true)
            );
    }

    public function test_saving_payroll_with_readiness_warnings_is_allowed_but_flashes_warning(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-02',
            'type' => 'regular',
            'is_saved' => false,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 5000000,
            'allowances_total' => 0,
            'deductions_total' => 0,
            'net_salary' => 5000000,
            'allowance_breakdown' => [],
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.save', $run))
            ->assertRedirect(route('hris.payrolls.index', ['period' => '2026-02', 'type' => 'regular']))
            ->assertSessionHas('warning', fn (mixed $message) => is_string($message) && str_contains($message, 'Payroll disimpan dengan'));

        $this->assertTrue($run->refresh()->is_saved);
    }

    public function test_bpjs_kesehatan_and_ketenagakerjaan_are_calculated_accurately(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        CompanySetting::query()->create([
            'user_id' => $user->id,
            'name' => 'Perusahaan Uji BPJS',
            'bpjs_kesehatan_enabled' => true,
            'bpjs_ketenagakerjaan_enabled' => true,
            'bpjs_jkk_rate' => 0.24,
            'bpjs_kesehatan_wage_cap' => 12_000_000,
            'bpjs_jp_wage_cap' => 10_042_300,
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 10_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'bpjs_kesehatan_number' => '00012345678',
            'bpjs_ketenagakerjaan_number' => '1234567890',
            'bpjs_kesehatan_enabled' => true,
            'bpjs_ketenagakerjaan_enabled' => true,
            'bpjs_jp_enabled' => true,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-05'])
            ->assertRedirect();

        // Calculations for Rp 10.000.000:
        // BPJS Kes Company (4%): 400.000, Employee (1%): 100.000
        // BPJS JKK (0.24%): 24.000, JKM (0.3%): 30.000
        // BPJS JHT Company (3.7%): 370.000, Employee (2%): 200.000
        // BPJS JP Company (2%): 200.000, Employee (1%): 100.000
        // Total BPJS Employee Deduction: 100.000 + 200.000 + 100.000 = 400.000
        // Total BPJS Company: 400.000 + 24.000 + 30.000 + 370.000 + 200.000 = 1.024.000
        // Net Salary: 10.000.000 - 400.000 = 9.600.000

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'base_salary' => 10000000.00,
            'bpjs_kesehatan_company' => 400000.00,
            'bpjs_kesehatan_employee' => 100000.00,
            'bpjs_jkk_company' => 24000.00,
            'bpjs_jkm_company' => 30000.00,
            'bpjs_jht_company' => 370000.00,
            'bpjs_jht_employee' => 200000.00,
            'bpjs_jp_company' => 200000.00,
            'bpjs_jp_employee' => 100000.00,
            'bpjs_total_company' => 1024000.00,
            'bpjs_total_employee' => 400000.00,
            'deductions_total' => 400000.00,
            'net_salary' => 9600000.00,
        ]);
    }

    public function test_position_based_overtime_events_hourly_and_fixed_rates_are_calculated_in_payroll(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $position = \App\Models\Position::factory()->create([
            'user_id' => $user->id,
            'name' => 'Store Manager',
        ]);

        CompanySetting::query()->create([
            'user_id' => $user->id,
            'overtime_events' => [
                [
                    'code' => 'OT_STORE_SM',
                    'name' => 'OT Store SM',
                    'nominal' => 20000,
                    'unit' => 'jam',
                    'position_ids' => [$position->id],
                ],
                [
                    'code' => 'LOAD',
                    'name' => 'Loading in-out event',
                    'nominal' => 150000,
                    'unit' => 'kegiatan',
                    'position_ids' => [$position->id],
                ],
            ],
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'position_id' => $position->id,
            'hire_date' => '2026-01-01',
            'base_salary' => 5000000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        // 1. Submit event overtime per jam (4 hours @ Rp 20.000 = Rp 80.000)
        $this->actingAs($user)->post(route('hris.overtimes.store'), [
            'employee_id' => $employee->id,
            'work_date' => '2026-06-05',
            'is_event' => true,
            'event_name' => 'OT Store SM',
            'start_time' => '18:00',
            'end_time' => '22:00',
            'break_minutes' => 0,
            'status' => 'approved',
            'reason' => 'Tutup toko bulanan',
        ])->assertRedirect();

        // 2. Submit event overtime flat / per kegiatan (Rp 150.000)
        $this->actingAs($user)->post(route('hris.overtimes.store'), [
            'employee_id' => $employee->id,
            'work_date' => '2026-06-06',
            'is_event' => true,
            'event_name' => 'Loading in-out event',
            'start_time' => '18:00',
            'end_time' => '22:00',
            'break_minutes' => 0,
            'status' => 'approved',
            'reason' => 'Loading barang bazaar',
        ])->assertRedirect();

        $this->assertDatabaseHas('overtime_requests', [
            'employee_id' => $employee->id,
            'event_name' => 'OT Store SM',
            'event_nominal' => 80000.00,
            'total_hours' => 4.00,
        ]);

        $this->assertDatabaseHas('overtime_requests', [
            'employee_id' => $employee->id,
            'event_name' => 'Loading in-out event',
            'event_nominal' => 150000.00,
        ]);

        // Generate payroll for 2026-06
        $this->actingAs($user)->post(route('hris.payrolls.generate'), ['period' => '2026-06'])
            ->assertRedirect();

        // Total overtime pay = 80.000 + 150.000 = 230.000
        // Net salary = 5.000.000 + 230.000 = 5.230.000
        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'base_salary' => 5000000.00,
            'overtime_pay' => 230000.00,
            'net_salary' => 5230000.00,
        ]);
    }

    public function test_bpjs_selective_programs_class_and_private_insurance_calculation(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        CompanySetting::query()->create([
            'user_id' => $user->id,
            'name' => 'PT Asuransi Sejahtera',
            'bpjs_kesehatan_enabled' => true,
            'bpjs_ketenagakerjaan_enabled' => true,
            'bpjs_jkk_enabled' => true,
            'bpjs_jkm_enabled' => true,
            'bpjs_jht_enabled' => true,
            'bpjs_jp_enabled' => false, // JP disabled at company level
            'bpjs_kesehatan_default_class' => 'I',
            'bpjs_jkk_rate' => 0.24,
            'private_insurance_enabled' => true,
            'private_insurance_name' => 'Prudential Corporate',
            'private_insurance_nominal' => 150_000,
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2026-01-01',
            'base_salary' => 10_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'bpjs_kesehatan_number' => '00012345678',
            'bpjs_ketenagakerjaan_number' => '1234567890',
            'bpjs_kesehatan_enabled' => true,
            'bpjs_kesehatan_class' => 'II',
            'bpjs_ketenagakerjaan_enabled' => true,
            'bpjs_jkk_enabled' => true,
            'bpjs_jkm_enabled' => false, // JKM disabled for this employee
            'bpjs_jht_enabled' => true,
            'bpjs_jp_enabled' => false,
            'private_insurance_enabled' => true,
            'private_insurance_name' => 'Prudential Platinum',
            'private_insurance_nominal' => 200_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-07'])
            ->assertRedirect();

        // Base 10.000.000:
        // BPJS Kes Company: 400.000, Employee: 100.000 (Class II)
        // BPJS JKK Company (0.24%): 24.000
        // BPJS JKM Company: 0 (disabled)
        // BPJS JHT Company (3.7%): 370.000, Employee (2%): 200.000
        // BPJS JP: 0 (disabled)
        // Private insurance deduction: 200.000
        // Total BPJS Company: 400.000 + 24.000 + 370.000 = 794.000
        // Total BPJS Employee (inc private insurance): 100.000 + 200.000 + 200.000 = 500.000
        // Net Salary: 10.000.000 - 500.000 = 9.500.000

        $this->assertDatabaseHas('payroll_items', [
            'employee_id' => $employee->id,
            'base_salary' => 10000000.00,
            'bpjs_kesehatan_class' => 'II',
            'bpjs_kesehatan_company' => 400000.00,
            'bpjs_kesehatan_employee' => 100000.00,
            'bpjs_jkk_company' => 24000.00,
            'bpjs_jkm_company' => 0.00,
            'bpjs_jht_company' => 370000.00,
            'bpjs_jht_employee' => 200000.00,
            'bpjs_jp_company' => 0.00,
            'bpjs_jp_employee' => 0.00,
            'private_insurance_name' => 'Prudential Platinum',
            'private_insurance_nominal' => 200000.00,
            'bpjs_total_company' => 794000.00,
            'bpjs_total_employee' => 500000.00,
            'deductions_total' => 500000.00,
            'net_salary' => 9500000.00,
        ]);
    }

    public function test_payroll_can_be_locked_and_unlocked_with_phone_number_pin()
    {
        $user1 = User::factory()->create([
            'email_verified_at' => now(),
            'phone' => '081234567890',
        ]);

        $user2 = User::factory()->create([
            'email_verified_at' => now(),
            'phone' => '089876543210',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user1->id,
            'base_salary' => 5_000_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user1)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-08'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user1->id)->where('period', '2026-08')->firstOrFail();
        $item = $run->items()->firstOrFail();

        // 1. User 1 locks payroll
        $this->actingAs($user1)
            ->post(route('hris.payrolls.lock', $run))
            ->assertRedirect()
            ->assertSessionHas('success');

        $run->refresh();
        $this->assertTrue($run->is_locked);
        $this->assertEquals($user1->id, $run->locked_by);

        // 2. User 1 (who locked it) CAN still edit payroll item
        $this->actingAs($user1)
            ->put(route('hris.payrolls.items.update', [$run, $item]), [
                'base_salary' => 6_000_000,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        // 3. Attach user2 as sub-account or team member
        // In our test, simulate another user in the company attempting to edit while locked by user 1
        // We set user2's owner ID to user1 or test controller check
        // For testing, user2 attempts unlock with WRONG PIN
        $this->actingAs($user1)
            ->post(route('hris.payrolls.lock', $run), [
                'pin' => '089999999999',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertTrue($run->fresh()->is_locked);

        // 4. Unlock with correct PIN (user 1's phone number)
        $this->actingAs($user1)
            ->post(route('hris.payrolls.lock', $run), [
                'pin' => '081234567890',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertFalse($run->fresh()->is_locked);
    }

    public function test_payroll_can_be_exported_as_csv(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-CSV-01',
            'first_name' => 'Budi',
            'last_name' => 'Santoso',
            'hire_date' => '2026-01-01',
            'base_salary' => 6_000_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        EmployeeBankAccount::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder_name' => 'BUDI SANTOSO',
            'is_primary' => true,
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-06'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-06')->firstOrFail();

        $this->actingAs($user)
            ->post(route('hris.payrolls.save', $run))
            ->assertRedirect();

        $response = $this->actingAs($user)
            ->get(route('hris.payrolls.export.csv', $run))
            ->assertOk();

        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
        $content = $response->streamedContent();
        $this->assertStringContainsString('EMP-CSV-01', $content);
        $this->assertStringContainsString('Budi Santoso', $content);
        $this->assertStringContainsString('BCA', $content);
        $this->assertStringContainsString('1234567890', $content);
    }

    public function test_thr_payroll_can_be_exported_as_csv(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'THR-CSV-01',
            'first_name' => 'Siti',
            'last_name' => 'Aminah',
            'hire_date' => '2025-01-01',
            'base_salary' => 5_000_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.thr.generate'), ['reference_date' => '2026-03-15'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-03')->where('type', 'thr')->firstOrFail();

        $this->actingAs($user)
            ->post(route('hris.payrolls.save', $run))
            ->assertRedirect();

        $response = $this->actingAs($user)
            ->get(route('hris.payrolls.export.csv', $run))
            ->assertOk();

        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
        $content = $response->streamedContent();
        $this->assertStringContainsString('THR-CSV-01', $content);
        $this->assertStringContainsString('Siti Aminah', $content);
        $this->assertStringContainsString('Masa Kerja (Bulan)', $content);
        $this->assertStringContainsString('Nominal THR', $content);
    }

    public function test_draft_payroll_can_be_exported_as_csv_before_being_saved(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'DRAFT-CSV-01',
            'first_name' => 'Ahmad',
            'last_name' => 'Dahlan',
            'hire_date' => '2026-01-01',
            'base_salary' => 7_500_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-07'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-07')->firstOrFail();
        $this->assertFalse($run->is_saved);

        $response = $this->actingAs($user)
            ->get(route('hris.payrolls.export.csv', $run))
            ->assertOk();

        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
        $this->assertStringContainsString('payroll_2026-07_draft.csv', (string) $response->headers->get('content-disposition'));
        $content = $response->streamedContent();
        $this->assertStringContainsString('DRAFT-CSV-01', $content);
        $this->assertStringContainsString('Ahmad Dahlan', $content);
    }

    public function test_payroll_generation_includes_attendance_late_penalties_in_denda_deductions(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'hire_date' => '2026-01-01',
            'base_salary' => 6_000_000,
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        // Create attendances with late penalties in May 2026
        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-10',
            'status' => 'late',
            'late_minutes' => 20,
            'late_penalty' => 20000,
            'check_in_at' => '2026-05-10 09:20:00',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-15',
            'status' => 'late',
            'late_minutes' => 45,
            'late_penalty' => 50000,
            'check_in_at' => '2026-05-15 09:45:00',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-05'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-05')->firstOrFail();
        $item = $run->items()->where('employee_id', $employee->id)->firstOrFail();

        // 20.000 + 50.000 = 70.000
        $this->assertEquals(70000.00, (float) $item->denda_deduction);
        $this->assertEquals(6000000.00 - 70000.00, (float) $item->net_salary);
    }

    public function test_draft_csv_export_contains_ktp_npwp_ptkp_itemized_allowances_and_benefit_columns(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-DRAFT-01',
            'first_name' => 'Dewi',
            'last_name' => 'Lestari',
            'ktp_number' => '3201019908870001',
            'npwp_number' => '098765432100000',
            'ptkp_category' => 'TK/0',
            'base_salary' => 5_000_000,
            'is_active' => true,
            'employment_status' => 'active',
        ]);

        EmployeeAllowance::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Transport',
            'amount' => 400_000,
            'is_active' => true,
            'effective_start_date' => '2026-01-01',
        ]);

        EmployeeAllowance::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'name' => 'Tunjangan Makan',
            'amount' => 350_000,
            'is_active' => true,
            'effective_start_date' => '2026-01-01',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-07'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-07')->firstOrFail();

        $response = $this->actingAs($user)
            ->get(route('hris.payrolls.export.csv', $run))
            ->assertOk();

        $content = $response->streamedContent();

        // Check tax and ID columns
        $this->assertStringContainsString('No. KTP', $content);
        $this->assertStringContainsString('No. NPWP', $content);
        $this->assertStringContainsString('Status Pajak', $content);
        $this->assertStringContainsString('3201019908870001', $content);
        $this->assertStringContainsString('098765432100000', $content);
        $this->assertStringContainsString('TK/0', $content);

        // Check itemized allowances and total
        $this->assertStringContainsString('Tunjangan Transport', $content);
        $this->assertStringContainsString('Tunjangan Makan', $content);
        $this->assertStringContainsString('Total Tunjangan Diterima', $content);

        // Check benefit categorization headers
        $this->assertStringContainsString('Benefit - BPJS TK Perusahaan', $content);
        $this->assertStringContainsString('Benefit - BPJS Kes Perusahaan', $content);
        $this->assertStringContainsString('Benefit - Tunjangan PPh 21', $content);
        $this->assertStringContainsString('Potongan PPh 21', $content);
    }

    public function test_unrecorded_attendance_cutoff_applies_half_day_prorate_deduction(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'active_working_days' => 20,
                'unrecorded_cutoff_penalty_enabled' => true,
                'attendance_revision_cutoff_day' => '25',
                'bpjs_kesehatan_enabled' => false,
                'bpjs_ketenagakerjaan_enabled' => false,
            ]
        );

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 4_000_000, // per day = 200.000, half day = 100.000
            'is_active' => true,
            'employment_status' => 'active',
            'hire_date' => '2026-01-01',
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        // No attendance recorded in May 2026 -> generates unrecorded cutoff penalty
        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-05'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-05')->firstOrFail();
        $item = $run->items()->where('employee_id', $employee->id)->firstOrFail();

        // Should have a deduction for unrecorded attendance days up to cutoff
        $this->assertGreaterThan(0, (float) $item->denda_deduction);
        $this->assertEquals((float) $item->base_salary - (float) $item->denda_deduction, (float) $item->net_salary);
    }

    public function test_csv_export_places_total_sum_row_above_header_for_both_draft_and_saved_payroll(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $emp1 = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-TOT-01',
            'first_name' => 'Karyawan',
            'last_name' => 'Satu',
            'base_salary' => 5_000_000,
            'is_active' => true,
            'employment_status' => 'active',
            'hire_date' => '2026-01-01',
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        $emp2 = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-TOT-02',
            'first_name' => 'Karyawan',
            'last_name' => 'Dua',
            'base_salary' => 7_000_000,
            'is_active' => true,
            'employment_status' => 'active',
            'hire_date' => '2026-01-01',
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-08'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-08')->firstOrFail();
        $this->assertFalse($run->is_saved);

        // 1. Test Draft CSV
        $responseDraft = $this->actingAs($user)
            ->get(route('hris.payrolls.export.csv', $run))
            ->assertOk();

        $contentDraft = $responseDraft->streamedContent();
        // Remove UTF-8 BOM if present
        $cleanContent = ltrim($contentDraft, "\xEF\xBB\xBF");
        $lines = explode("\n", trim($cleanContent));

        // Line 0 must be TOTAL row
        $totalRow = str_getcsv($lines[0]);
        $this->assertEquals('TOTAL', $totalRow[0]);

        // Line 1 must be table header
        $headerRow = str_getcsv($lines[1]);
        $this->assertEquals('No', $headerRow[0]);
        $this->assertEquals('NIK', $headerRow[1]);
        $this->assertEquals('Nama Karyawan', $headerRow[2]);

        // Check Gaji Pokok column index
        $gajiPokokIndex = array_search('Gaji Pokok', $headerRow, true);
        $this->assertNotFalse($gajiPokokIndex);
        $this->assertEquals(12_000_000, (int) $totalRow[$gajiPokokIndex]);

        // Check Gaji Bersih column index
        $gajiBersihIndex = array_search('Gaji Bersih', $headerRow, true);
        $this->assertNotFalse($gajiBersihIndex);
        $this->assertEquals(12_000_000, (int) $totalRow[$gajiBersihIndex]);

        // 2. Save Payroll and test Saved CSV
        $this->actingAs($user)
            ->post(route('hris.payrolls.save', $run))
            ->assertRedirect();
        $this->assertTrue($run->fresh()->is_saved);

        $responseSaved = $this->actingAs($user)
            ->get(route('hris.payrolls.export.csv', $run))
            ->assertOk();

        $cleanSavedContent = ltrim($responseSaved->streamedContent(), "\xEF\xBB\xBF");
        $savedLines = explode("\n", trim($cleanSavedContent));

        $savedTotalRow = str_getcsv($savedLines[0]);
        $this->assertEquals('TOTAL', $savedTotalRow[0]);
        $this->assertEquals(12_000_000, (int) $savedTotalRow[$gajiPokokIndex]);

        $savedHeaderRow = str_getcsv($savedLines[1]);
        $this->assertEquals('No', $savedHeaderRow[0]);
        $this->assertEquals('Gaji Pokok', $savedHeaderRow[$gajiPokokIndex]);
    }

    public function test_excel_export_places_total_sum_row_above_header(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $emp = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 6_000_000,
            'is_active' => true,
            'employment_status' => 'active',
            'hire_date' => '2026-01-01',
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-09'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-09')->firstOrFail();

        $response = $this->actingAs($user)
            ->get(route('hris.payrolls.export.excel', $run))
            ->assertOk();

        $this->assertEquals('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $response->headers->get('content-type'));

        // Load spreadsheet from streamed content
        $stream = $response->streamedContent();
        $temp = tempnam(sys_get_temp_dir(), 'test_payroll_excel_');
        file_put_contents($temp, $stream);

        $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
        $spreadsheet = $reader->load($temp);
        $sheet = $spreadsheet->getActiveSheet();

        // Row 1: TOTAL
        $this->assertEquals('TOTAL', $sheet->getCell('A1')->getValue());
        $this->assertStringStartsWith('=SUM(', (string) $sheet->getCell('N1')->getValue());

        // Row 2: Table Header
        $this->assertEquals('No', $sheet->getCell('A2')->getValue());
        $this->assertEquals('Gaji Pokok', $sheet->getCell('N2')->getValue());

        // Row 3: Employee Data
        $this->assertEquals(6_000_000, (int) $sheet->getCell('N3')->getValue());

        unlink($temp);
    }

    public function test_payroll_generation_accumulates_penalties_using_configured_cutoff_period(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        \App\Models\CompanySetting::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'PT Cutoff Test',
                'active_working_days' => 22,
                'payroll_cutoff_day' => '25',
                'late_penalty_enabled' => true,
            ]
        );

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'base_salary' => 5_000_000,
            'hire_date' => '2026-01-01',
            'is_active' => true,
            'employment_status' => 'active',
            'pph21_method' => 'gross',
            'pph21_rate' => 0,
            'bpjs_kesehatan_enabled' => false,
            'bpjs_ketenagakerjaan_enabled' => false,
        ]);

        // Penalty within cutoff: 2026-08-27 (period: 2026-08-26 to 2026-09-25)
        \App\Models\EmployeeAttendance::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-08-27',
            'status' => 'late',
            'late_minutes' => 30,
            'late_penalty' => 50000.00,
            'timezone' => 'Asia/Jakarta',
        ]);

        // Penalty within cutoff: 2026-09-10
        \App\Models\EmployeeAttendance::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-09-10',
            'status' => 'late',
            'late_minutes' => 45,
            'late_penalty' => 75000.00,
            'timezone' => 'Asia/Jakarta',
        ]);

        // Penalty AFTER cutoff: 2026-09-26 (belongs to October period)
        \App\Models\EmployeeAttendance::create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-09-26',
            'status' => 'late',
            'late_minutes' => 60,
            'late_penalty' => 100000.00,
            'timezone' => 'Asia/Jakarta',
        ]);

        $this->actingAs($user)
            ->post(route('hris.payrolls.generate'), ['period' => '2026-09'])
            ->assertRedirect();

        $run = PayrollRun::query()->where('user_id', $user->id)->where('period', '2026-09')->firstOrFail();
        $this->assertEquals('2026-08-26', $run->period_start->toDateString());
        $this->assertEquals('2026-09-25', $run->period_end->toDateString());

        $item = $run->items()->where('employee_id', $employee->id)->firstOrFail();
        // 50.000 + 75.000 = 125.000 (excludes 100.000 on 2026-09-26)
        $this->assertEquals(125000.00, (float) $item->denda_deduction);
        $this->assertEquals(5000000.00 - 125000.00, (float) $item->net_salary);
    }
}
