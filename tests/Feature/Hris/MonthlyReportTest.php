<?php

namespace Tests\Feature\Hris;

use App\Models\CompanyAsset;
use App\Models\CompanyAssetAssignment;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeDocument;
use App\Models\EmployeeLeaveBalance;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\PerformancePeriod;
use App\Models\PerformanceReview;
use App\Models\User;
use App\Services\MonthlyReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MonthlyReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_monthly_report_page_uses_month_and_year_period(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        CompanySetting::query()->create([
            'user_id' => $user->id,
            'name' => 'PT Humi Test',
            'details' => 'Makassar',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-001',
            'first_name' => 'Dio',
            'last_name' => 'Manuaba',
            'is_active' => true,
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-08',
            'status' => 'present',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-06-08',
            'status' => 'late',
        ]);

        LeaveRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'start_date' => '2026-05-10',
            'end_date' => '2026-05-11',
            'total_days' => 2,
            'status' => 'approved',
        ]);

        OvertimeRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-12',
            'total_hours' => 3.5,
            'status' => 'approved',
        ]);

        $payrollRun = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'employees_count' => 1,
            'total_base_salary' => 5_000_000,
            'total_allowances' => 500_000,
            'total_deductions' => 250_000,
            'total_net_salary' => 5_250_000,
            'is_saved' => true,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $payrollRun->id,
            'employee_id' => $employee->id,
            'net_salary' => 5_250_000,
        ]);

        $this->actingAs($user)
            ->get(route('hris.reports.index', ['month' => 5, 'year' => 2026]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/reports/index')
                ->where('filters.month', 5)
                ->where('filters.year', 2026)
                ->where('period.key', '2026-05')
                ->where('summary.active_employees', 1)
                ->where('summary.attendance.present', 1)
                ->where('summary.attendance.late', 0)
                ->where('summary.leave.approved_days', 2)
                ->where('summary.overtime.approved_hours', 3.5)
                ->where('summary.payroll.net_salary', '5250000.00')
                ->where('employees.0.employee_code', 'EMP-001')
                ->where('employees.0.present_count', 1)
                ->where('employees.0.late_count', 0)
                ->where('employees.0.leave_days', 2)
                ->where('employees.0.overtime_hours', 3.5)
            );
    }

    public function test_monthly_report_can_be_exported_as_pdf(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        CompanySetting::query()->create([
            'user_id' => $user->id,
            'name' => 'PT Export Report',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EXP-001',
            'first_name' => 'Sinta',
            'last_name' => 'Rahma',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-08',
            'status' => 'present',
        ]);

        $response = $this->actingAs($user)
            ->get(route('hris.reports.export', ['month' => 5, 'year' => 2026]));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_monthly_report_includes_attendance_payroll_leave_and_overtime_sections(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'REP-001',
            'first_name' => 'Andi',
            'last_name' => 'Wijaya',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-02',
            'status' => 'present',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-03',
            'status' => 'late',
        ]);

        $payrollRun = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'employees_count' => 1,
            'total_base_salary' => 6_000_000,
            'total_allowances' => 750_000,
            'total_deductions' => 300_000,
            'total_net_salary' => 6_450_000,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $payrollRun->id,
            'employee_id' => $employee->id,
            'base_salary' => 6_000_000,
            'allowances_total' => 750_000,
            'overtime_hours' => 4,
            'overtime_pay' => 400_000,
            'deductions_total' => 300_000,
            'net_salary' => 6_450_000,
        ]);

        LeaveRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'start_date' => '2026-05-06',
            'end_date' => '2026-05-07',
            'total_days' => 2,
            'status' => 'approved',
        ]);

        LeaveRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'start_date' => '2026-05-13',
            'end_date' => '2026-05-13',
            'total_days' => 1,
            'status' => 'pending',
        ]);

        EmployeeLeaveBalance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'year' => 2026,
            'policy_type' => 'annual',
            'total_quota' => 12,
            'accrued_days' => 12,
            'used_days' => 2,
            'adjusted_days' => 1,
        ]);

        OvertimeRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-08',
            'total_hours' => 3.5,
            'status' => 'approved',
        ]);

        OvertimeRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-05-09',
            'total_hours' => 1.5,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->get(route('hris.reports.index', ['month' => 5, 'year' => 2026]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('attendanceDetails.0.employee_code', 'REP-001')
                ->where('attendanceDetails.0.recorded_days', 2)
                ->where('attendanceDetails.0.present_count', 1)
                ->where('attendanceDetails.0.late_count', 1)
                ->where('payrollDetails.0.employee_code', 'REP-001')
                ->where('payrollDetails.0.base_salary', '6000000.00')
                ->where('payrollDetails.0.allowances_total', '750000.00')
                ->where('payrollDetails.0.overtime_pay', '400000.00')
                ->where('payrollDetails.0.deductions_total', '300000.00')
                ->where('payrollDetails.0.net_salary', '6450000.00')
                ->where('leaveDetails.0.employee_code', 'REP-001')
                ->where('leaveDetails.0.approved_days', 2)
                ->where('leaveDetails.0.pending_days', 1)
                ->where('leaveDetails.0.remaining_balance', 11)
                ->where('overtimeDetails.0.employee_code', 'REP-001')
                ->where('overtimeDetails.0.approved_requests', 1)
                ->where('overtimeDetails.0.pending_requests', 1)
                ->where('overtimeDetails.0.approved_hours', 3.5)
            );
    }

    public function test_monthly_report_includes_employee_movement_document_and_asset_sections(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $newEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'JOIN-001',
            'first_name' => 'Nia',
            'last_name' => 'Putri',
            'hire_date' => '2026-05-03',
            'employment_status' => 'active',
            'is_active' => true,
        ]);

        $offboardedEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EXIT-001',
            'first_name' => 'Rian',
            'last_name' => 'Saputra',
            'hire_date' => '2025-08-01',
            'offboarded_at' => '2026-05-20',
            'employment_status' => 'resigned',
            'is_active' => false,
        ]);

        Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'OLD-001',
            'hire_date' => '2025-01-01',
            'employment_status' => 'active',
            'is_active' => true,
        ]);

        EmployeeDocument::query()->create([
            'user_id' => $user->id,
            'employee_id' => $newEmployee->id,
            'document_type' => 'contract',
            'document_number' => 'PKWT-001',
            'expires_at' => '2026-05-15',
            'file_path' => 'employee-documents/pkwt.pdf',
        ]);

        EmployeeDocument::query()->create([
            'user_id' => $user->id,
            'employee_id' => $offboardedEmployee->id,
            'document_type' => 'ktp',
            'document_number' => 'KTP-001',
            'expires_at' => '2026-06-05',
            'file_path' => 'employee-documents/ktp.pdf',
        ]);

        $laptop = CompanyAsset::query()->create([
            'user_id' => $user->id,
            'asset_code' => 'AST-001',
            'name' => 'MacBook Air',
            'category' => 'Laptop',
            'condition' => 'good',
            'status' => 'assigned',
        ]);

        CompanyAssetAssignment::query()->create([
            'user_id' => $user->id,
            'company_asset_id' => $laptop->id,
            'employee_id' => $newEmployee->id,
            'issued_at' => '2026-05-04',
            'condition_out' => 'good',
        ]);

        $returnedPhone = CompanyAsset::query()->create([
            'user_id' => $user->id,
            'asset_code' => 'AST-002',
            'name' => 'iPhone 15',
            'category' => 'Phone',
            'condition' => 'good',
            'status' => 'available',
        ]);

        CompanyAssetAssignment::query()->create([
            'user_id' => $user->id,
            'company_asset_id' => $returnedPhone->id,
            'employee_id' => $offboardedEmployee->id,
            'issued_at' => '2026-04-01',
            'returned_at' => '2026-05-22',
            'condition_out' => 'good',
            'condition_in' => 'good',
        ]);

        $this->actingAs($user)
            ->get(route('hris.reports.index', ['month' => 5, 'year' => 2026]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('employeeMovementDetails.joiners.0.employee_code', 'JOIN-001')
                ->where('employeeMovementDetails.offboarded.0.employee_code', 'EXIT-001')
                ->where('employeeMovementDetails.summary.joiners', 1)
                ->where('employeeMovementDetails.summary.offboarded', 1)
                ->where('employeeMovementDetails.summary.active_headcount', 2)
                ->where('documentExpiryDetails.0.employee_code', 'JOIN-001')
                ->where('documentExpiryDetails.0.document_type', 'contract')
                ->where('documentExpiryDetails.0.status', 'expired')
                ->where('assetAssignmentDetails.0.asset_code', 'AST-001')
                ->where('assetAssignmentDetails.0.employee_code', 'JOIN-001')
                ->where('assetAssignmentDetails.0.assignment_status', 'assigned')
                ->where('assetAssignmentDetails.1.asset_code', 'AST-002')
                ->where('assetAssignmentDetails.1.assignment_status', 'returned')
            );
    }

    public function test_monthly_report_includes_performance_recruitment_and_analytics_sections(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'KPI-001',
            'first_name' => 'Maya',
            'last_name' => 'Sari',
            'is_active' => true,
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-06',
            'status' => 'present',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-07',
            'status' => 'late',
        ]);

        LeaveRequest::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'start_date' => '2026-05-10',
            'end_date' => '2026-05-10',
            'total_days' => 1,
            'status' => 'approved',
        ]);

        $payrollRun = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'employees_count' => 1,
            'total_net_salary' => 7_000_000,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $payrollRun->id,
            'employee_id' => $employee->id,
            'net_salary' => 7_000_000,
        ]);

        $period = PerformancePeriod::query()->create([
            'user_id' => $user->id,
            'name' => 'Q2 2026',
            'starts_at' => '2026-04-01',
            'ends_at' => '2026-06-30',
            'status' => 'active',
        ]);

        PerformanceReview::query()->create([
            'user_id' => $user->id,
            'performance_period_id' => $period->id,
            'employee_id' => $employee->id,
            'status' => 'completed',
            'okr_score' => 88,
            'kpi_score' => 92,
            'manager_score' => 90,
            'final_score' => 90,
            'reviewed_at' => '2026-05-29 10:00:00',
        ]);

        $vacancy = JobVacancy::query()->create([
            'user_id' => $user->id,
            'title' => 'Backend Engineer',
            'slug' => 'backend-engineer-report-test',
            'status' => 'published',
            'openings' => 2,
            'published_at' => '2026-05-01 00:00:00',
            'closing_date' => '2026-05-31',
        ]);

        JobApplication::factory()->create([
            'user_id' => $user->id,
            'job_vacancy_id' => $vacancy->id,
            'full_name' => 'Ayu Kandidat',
            'stage' => 'hired',
            'created_at' => '2026-05-03 09:00:00',
        ]);

        JobApplication::factory()->create([
            'user_id' => $user->id,
            'job_vacancy_id' => $vacancy->id,
            'full_name' => 'Bima Kandidat',
            'stage' => 'rejected',
            'created_at' => '2026-05-04 09:00:00',
        ]);

        $this->actingAs($user)
            ->get(route('hris.reports.index', ['month' => 5, 'year' => 2026]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('performanceDetails.summary.reviews', 1)
                ->where('performanceDetails.summary.completed_reviews', 1)
                ->where('performanceDetails.summary.average_final_score', 90)
                ->where('performanceDetails.rows.0.employee_code', 'KPI-001')
                ->where('performanceDetails.rows.0.period_name', 'Q2 2026')
                ->where('performanceDetails.rows.0.final_score', 90)
                ->where('performanceDetails.rows.0.grade', 'A')
                ->where('recruitmentDetails.summary.active_vacancies', 1)
                ->where('recruitmentDetails.summary.applications', 2)
                ->where('recruitmentDetails.summary.hired', 1)
                ->where('recruitmentDetails.summary.rejected', 1)
                ->where('recruitmentDetails.vacancies.0.title', 'Backend Engineer')
                ->where('recruitmentDetails.vacancies.0.applications_count', 2)
                ->where('analytics.cards.0.key', 'headcount')
                ->where('analytics.cards.0.value', 1)
                ->where('analytics.cards.4.key', 'performance_score')
                ->where('analytics.cards.4.value', 90)
                ->where('analytics.cards.5.key', 'recruitment_hires')
                ->where('analytics.cards.5.value', 1)
            );
    }

    public function test_monthly_report_pdf_template_uses_formatted_period_dates(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $report = app(MonthlyReportService::class)->build($user->id, 5, 2026);
        $html = view('hris.reports.monthly', [
            ...$report,
            'documentTitle' => 'Laporan_HRIS_2026-05.pdf',
        ])->render();

        $this->assertStringContainsString('1 Mei 2026 s/d 31 Mei 2026', $html);
        $this->assertStringNotContainsString('2026-05-01 s/d 2026-05-31', $html);
    }

    public function test_monthly_report_pdf_template_includes_detail_sections(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'PDF-001',
            'first_name' => 'Budi',
            'last_name' => 'Santoso',
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-05',
            'status' => 'present',
        ]);

        $payrollRun = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-05',
            'total_base_salary' => 4_000_000,
            'total_net_salary' => 4_000_000,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $payrollRun->id,
            'employee_id' => $employee->id,
            'base_salary' => 4_000_000,
            'net_salary' => 4_000_000,
        ]);

        $report = app(MonthlyReportService::class)->build($user->id, 5, 2026);
        $html = view('hris.reports.monthly', [
            ...$report,
            'documentTitle' => 'Laporan_HRIS_2026-05.pdf',
        ])->render();

        $this->assertStringContainsString('Absensi Bulanan Detail', $html);
        $this->assertStringContainsString('Payroll Bulanan', $html);
        $this->assertStringContainsString('Cuti & Sisa Cuti', $html);
        $this->assertStringContainsString('Lembur', $html);
        $this->assertStringContainsString('Mutasi Karyawan', $html);
        $this->assertStringContainsString('Kontrak & Dokumen Expired', $html);
        $this->assertStringContainsString('Asset Karyawan', $html);
        $this->assertStringContainsString('Dashboard Analitik', $html);
        $this->assertStringContainsString('Performance/KPI', $html);
        $this->assertStringContainsString('Recruitment', $html);
        $this->assertStringContainsString('PDF-001', $html);
        $this->assertStringContainsString('Rp 4.000.000', $html);
    }
}
