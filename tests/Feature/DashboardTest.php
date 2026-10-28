<?php

namespace Tests\Feature;

use App\Models\AttendanceCorrectionRequest;
use App\Models\ClientInvoice;
use App\Models\CompanySetting;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeDocument;
use App\Models\EmployeeSchedule;
use App\Models\JobVacancy;
use App\Models\LeaveRequest;
use App\Models\ManpowerRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\ReimbursementRequest;
use App\Models\ShiftChangeRequest;
use App\Models\SubCompany;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_sub_user_is_redirected_to_portal_when_opening_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('portal.index'));
    }

    public function test_dashboard_widgets_use_dynamic_hris_metrics(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $firstEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'is_active' => true,
            'employment_status' => 'active',
        ]);
        $secondEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'is_active' => true,
            'employment_status' => 'active',
        ]);
        Employee::factory()->create([
            'user_id' => $user->id,
            'is_active' => false,
            'employment_status' => 'resigned',
            'updated_at' => now(),
        ]);

        EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $firstEmployee->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'present',
        ]);
        EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $secondEmployee->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'on_leave',
        ]);

        JobVacancy::query()->create([
            'user_id' => $user->id,
            'title' => 'Backend Engineer',
            'slug' => 'backend-engineer-dashboard-test',
            'status' => 'published',
            'openings' => 6,
            'closing_date' => now()->addWeek()->toDateString(),
        ]);
        JobVacancy::query()->create([
            'user_id' => $user->id,
            'title' => 'Closed Role',
            'slug' => 'closed-role-dashboard-test',
            'status' => 'closed',
            'openings' => 4,
            'closing_date' => now()->addWeek()->toDateString(),
        ]);

        PayrollRun::factory()->released()->create([
            'user_id' => $user->id,
            'period' => now()->format('Y-m'),
            'total_net_salary' => 612_000_000,
            'generated_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard')
                ->where('stats.total_employees', 3)
                ->where('stats.present_today', 1)
                ->where('stats.on_leave_today', 1)
                ->where('stats.open_positions', 6)
                ->where('stats.monthly_payroll_burn', 612000000)
                ->where('stats.attrition_ytd', 33.3)
                ->where('stats.resigned_ytd', 1)
            );
    }

    public function test_dashboard_includes_outsourcing_summary(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subCompany = SubCompany::query()->create([
            'user_id' => $user->id,
            'code' => 'CLN',
            'name' => 'Client Nusantara',
            'is_active' => true,
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => $subCompany->id,
            'is_active' => true,
            'base_salary' => 5_000_000,
        ]);

        Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => null,
            'is_active' => true,
        ]);

        EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'present',
        ]);

        ClientInvoice::query()->create([
            'user_id' => $user->id,
            'sub_company_id' => $subCompany->id,
            'invoice_number' => 'INV-OUT-001',
            'period' => now()->format('Y-m'),
            'issued_at' => now()->toDateString(),
            'status' => 'sent',
            'employee_count' => 1,
            'payroll_cost' => 5_000_000,
            'service_fee' => 1_000_000,
            'tax_amount' => 110_000,
            'total_amount' => 6_110_000,
        ]);

        ManpowerRequest::query()->create([
            'user_id' => $user->id,
            'sub_company_id' => $subCompany->id,
            'request_number' => 'MPR-001',
            'title' => 'Operator Produksi',
            'requested_headcount' => 3,
            'fulfilled_headcount' => 1,
            'status' => 'open',
            'priority' => 'normal',
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard')
                ->where('outsourcing.stats.active_clients', 1)
                ->where('outsourcing.stats.outsourced_employees', 1)
                ->where('outsourcing.stats.internal_employees', 1)
                ->where('outsourcing.stats.present_today', 1)
                ->where('outsourcing.stats.billed_amount', 6110000)
                ->where('outsourcing.stats.payroll_cost', 5000000)
                ->where('outsourcing.stats.gross_margin', 1110000)
                ->where('outsourcing.stats.remaining_manpower', 2)
                ->where('outsourcing.perClient.0.label', 'CLN - Client Nusantara')
                ->where('outsourcing.perClient.0.outstanding_invoice', 6110000)
                ->where('outsourcing.perClient.0.sla_score', 50)
                ->where('outsourcing.perClient.0.sla_breaches', ['manpower', 'billing'])
            );
    }

    public function test_dashboard_includes_action_queue(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $shift = WorkShift::query()->create([
            'user_id' => $user->id,
            'code' => 'P',
            'name' => 'Pagi',
            'start_time' => '08:00',
            'end_time' => '17:00',
        ]);

        AttendanceCorrectionRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => now()->toDateString(),
            'reason' => 'Lupa check-in',
            'status' => 'pending',
        ]);

        LeaveRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'total_days' => 1,
            'reason' => 'Urus keluarga',
            'status' => 'pending',
        ]);

        OvertimeRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => now()->toDateString(),
            'start_time' => '18:00',
            'end_time' => '20:00',
            'break_minutes' => 0,
            'total_hours' => 2,
            'reason' => 'Closing',
            'status' => 'pending',
        ]);

        ShiftChangeRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'requested_date' => now()->addDay()->toDateString(),
            'requested_shift_id' => $shift->id,
            'reason' => 'Tukar shift',
            'status' => 'pending',
        ]);

        EmployeeDocument::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'document_type' => 'sim',
            'file_disk' => 'local',
            'file_path' => 'employee-documents/sim.pdf',
            'expires_at' => now()->addDays(10)->toDateString(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard')
                ->where('actionQueue.total', 5)
                ->where('actionQueue.items.0.key', 'attendance_corrections')
                ->where('actionQueue.items.0.count', 1)
                ->where('actionQueue.items.1.key', 'leave_approvals')
            );
    }

    public function test_dashboard_includes_daily_focus_and_recent_requests_without_setup_cards(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $user->id,
        ]);
        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
        ]);

        $lateEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'is_active' => true,
        ]);
        $missingEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'is_active' => true,
        ]);

        $shift = WorkShift::query()->create([
            'user_id' => $user->id,
            'code' => 'P',
            'name' => 'Pagi',
            'start_time' => '08:00',
            'end_time' => '17:00',
        ]);

        EmployeeSchedule::query()->create([
            'user_id' => $user->id,
            'employee_id' => $lateEmployee->id,
            'work_date' => now()->toDateString(),
            'shift_code' => 'P',
            'start_time' => '08:00',
            'end_time' => '17:00',
            'is_day_off' => false,
        ]);

        $lateAttendance = EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $lateEmployee->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'late',
            'check_in_at' => now()->setTime(8, 30),
        ]);

        LeaveRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $lateEmployee->id,
            'leave_type' => 'sick',
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'total_days' => 1,
            'reason' => 'Sakit',
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard')
                ->where('attendanceFocus.missing_clock_ins_count', 1)
                ->where('attendanceFocus.late_today_count', 1)
                ->where('attendanceFocus.missingClockIns.0.id', $missingEmployee->id)
                ->where('attendanceFocus.lateToday.0.id', $lateAttendance->id)
                ->where('recentRequests.items.0.type', 'Cuti/Sakit')
                ->missing('payrollReadiness')
                ->missing('onboardingChecklist')
            );
    }

    public function test_dashboard_limits_operational_cards_and_includes_contract_reminders(): void
    {
        $this->travelTo(now()->startOfDay());

        $user = User::factory()->create(['email_verified_at' => now()]);
        $contractEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'PKWT-001',
            'first_name' => 'Kontrak',
            'last_name' => null,
            'is_active' => true,
            'employment_type' => 'PKWT',
            'contract_end_date' => now()->addDays(10)->toDateString(),
        ]);
        Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'PROB-001',
            'first_name' => 'Probation',
            'last_name' => null,
            'is_active' => true,
            'employment_status' => 'probation',
            'probation_end_date' => now()->addDays(5)->toDateString(),
        ]);

        Employee::factory()->count(4)->create([
            'user_id' => $user->id,
            'is_active' => true,
        ]);

        foreach (range(1, 6) as $index) {
            LeaveRequest::query()->create([
                'user_id' => $user->id,
                'employee_id' => $contractEmployee->id,
                'leave_type' => 'annual',
                'start_date' => now()->addDays($index)->toDateString(),
                'end_date' => now()->addDays($index)->toDateString(),
                'total_days' => 1,
                'reason' => 'Request '.$index,
                'status' => 'pending',
            ]);
        }

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('attendanceFocus.items', 6)
                ->has('recentRequests.items', 6)
                ->where('contractReminders.total', 2)
                ->has('contractReminders.items', 2)
                ->where('contractReminders.items.0.type', 'Probation')
                ->where('contractReminders.items.1.type', 'Kontrak')
            );
    }

    public function test_dashboard_filters_attendance_chart_and_reminders_by_selected_period(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'is_active' => true,
        ]);

        // Create data in previous period (2026-05)
        EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-15',
            'status' => 'late',
            'check_in_at' => Carbon::parse('2026-05-15 09:15:00'),
        ]);

        LeaveRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'start_date' => '2026-05-10',
            'end_date' => '2026-05-12',
            'total_days' => 3,
            'reason' => 'Liburan',
            'status' => 'approved',
            'created_at' => Carbon::parse('2026-05-01 10:00:00'),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard', ['period' => '2026-05']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('filters.period', '2026-05')
                ->has('attendanceChart', 31)
                ->where('attendanceFocus.late_today_count', 1)
                ->has('recentRequests.items', 1)
                ->where('recentRequests.items.0.type', 'Cuti/Sakit')
            );
    }

    public function test_dashboard_includes_financial_and_mobility_analytics_charts(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));

        $response->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard')
                ->has('payrollBurnrate', fn (AssertableInertia $p) => $p
                    ->has('current_burnrate')
                    ->has('previous_burnrate')
                    ->has('growth_rate')
                    ->has('avg_per_employee')
                    ->has('trend', 6)
                )
                ->has('insuranceBurnrate', fn (AssertableInertia $p) => $p
                    ->has('current_insurance_burn')
                    ->has('bpjs_kesehatan_current')
                    ->has('bpjs_tk_current')
                    ->has('ratio_to_payroll')
                    ->has('trend', 6)
                )
                ->has('employeeMobility', fn (AssertableInertia $p) => $p
                    ->has('total_hires')
                    ->has('total_exits')
                    ->has('total_mutations')
                    ->has('net_growth')
                    ->has('avg_turnover_rate')
                    ->has('trend', 6)
                )
                ->has('reimburseRate', fn (AssertableInertia $p) => $p
                    ->has('current_approved_amount')
                    ->has('current_total_count')
                    ->has('current_approval_rate')
                    ->has('avg_claim_amount')
                    ->has('trend', 6)
                )
            );
    }

    public function test_dashboard_includes_executive_qa_insights(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));

        $response->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard')
                ->has('executiveInsights', fn (AssertableInertia $p) => $p
                    ->has('active_employees', fn (AssertableInertia $sub) => $sub
                        ->has('total')
                        ->has('active')
                        ->has('active_rate')
                        ->has('pkwtt_count')
                        ->has('pkwt_count')
                        ->has('probation_count')
                        ->has('resigned_count')
                    )
                    ->has('payroll_cost', fn (AssertableInertia $sub) => $sub
                        ->has('total_cost')
                        ->has('base_cost')
                        ->has('allowance_cost')
                        ->has('growth_rate')
                        ->has('avg_per_employee')
                        ->has('is_projected')
                    )
                    ->has('attendance_improvement', fn (AssertableInertia $sub) => $sub
                        ->has('verdict')
                        ->has('verdict_label')
                        ->has('verdict_badge')
                        ->has('attendance_rate')
                        ->has('prev_attendance_rate')
                        ->has('attendance_diff')
                        ->has('late_rate')
                        ->has('prev_late_rate')
                        ->has('late_diff')
                        ->has('present_count')
                        ->has('late_count')
                        ->has('absent_count')
                    )
                    ->has('department_shortage', fn (AssertableInertia $sub) => $sub
                        ->has('total_shortage')
                        ->has('departments')
                    )
                    ->has('frequent_late_and_absent', fn (AssertableInertia $sub) => $sub
                        ->has('top_late')
                        ->has('top_absent')
                    )
                    ->has('contract_expiring', fn (AssertableInertia $sub) => $sub
                        ->has('total_expiring')
                        ->has('items')
                    )
                    ->has('turnover_rate', fn (AssertableInertia $sub) => $sub
                        ->has('rate')
                        ->has('status')
                        ->has('status_label')
                        ->has('retention_rate')
                        ->has('resigned_ytd')
                        ->has('active_employees')
                    )
                )
            );
    }

    public function test_dashboard_includes_pie_charts_breakdown(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $division = Division::factory()->create(['user_id' => $user->id, 'name' => 'Teknologi']);

        Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'gender' => 'male',
            'is_active' => true,
            'base_salary' => 15_000_000,
        ]);

        Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'gender' => 'female',
            'is_active' => true,
            'base_salary' => 12_000_000,
        ]);

        Employee::factory()->create([
            'user_id' => $user->id,
            'gender' => 'male',
            'is_active' => false,
            'employment_status' => 'resigned',
            'offboarding_reason' => 'resigned',
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard')
                ->has('pieCharts', fn (AssertableInertia $pie) => $pie
                    ->has('gender_by_division', fn (AssertableInertia $sub) => $sub
                        ->has('divisions')
                        ->has('overall')
                    )
                    ->has('payroll_by_division', fn (AssertableInertia $sub) => $sub
                        ->has('total')
                        ->has('period_label')
                        ->has('divisions')
                    )
                    ->has('reimburse_by_category', fn (AssertableInertia $sub) => $sub
                        ->has('total')
                        ->has('period_label')
                        ->has('categories')
                    )
                    ->has('reimburse_by_division', fn (AssertableInertia $sub) => $sub
                        ->has('total')
                        ->has('period_label')
                        ->has('divisions')
                    )
                    ->has('resign_reasons', fn (AssertableInertia $sub) => $sub
                        ->has('total')
                        ->has('reasons')
                    )
                )
            );
    }

    public function test_payroll_charts_only_include_locked_or_released_runs(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $division = Division::query()->create(['user_id' => $user->id, 'name' => 'Engineering', 'code' => 'ENG']);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'is_active' => true,
            'base_salary' => 15_000_000,
        ]);

        $period = now()->format('Y-m');

        // 1. Create a draft (unlocked, not released) payroll run
        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => $period,
            'status' => 'draft',
            'is_locked' => false,
            'released_at' => null,
            'total_net_salary' => 15_000_000,
            'total_base_salary' => 15_000_000,
            'employees_count' => 1,
            'generated_at' => now(),
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'base_salary' => 15_000_000,
            'net_salary' => 15_000_000,
        ]);

        // Draft payroll should NOT enter chart
        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('pieCharts.payroll_by_division.total', 0)
                ->where('pieCharts.payroll_by_division.divisions', [])
                ->where('payrollBurnrate.current_burnrate', 0)
            );

        // 2. Lock the payroll run
        $run->update(['is_locked' => true, 'locked_at' => now()]);

        // Locked payroll MUST enter chart
        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('pieCharts.payroll_by_division.total', 15000000)
                ->where('payrollBurnrate.current_burnrate', 15000000)
            );
    }

    public function test_reimburse_charts_only_include_paid_status(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'is_active' => true,
        ]);

        // Create pending, approved, and processing requests - none are 'paid' yet
        ReimbursementRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'category' => 'Meals',
            'title' => 'Makan Siang',
            'description' => 'Makan siang rapat',
            'amount' => 100_000,
            'status' => 'pending',
            'created_at' => now(),
        ]);

        ReimbursementRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'category' => 'Travels',
            'title' => 'Taksi Client',
            'description' => 'Transport meeting',
            'amount' => 200_000,
            'status' => 'approved',
            'approved_at' => now(),
            'created_at' => now(),
        ]);

        ReimbursementRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'category' => 'Supplies',
            'title' => 'Kertas Printer',
            'description' => 'ATK kantor',
            'amount' => 300_000,
            'status' => 'processing',
            'approved_at' => now(),
            'processed_at' => now(),
            'created_at' => now(),
        ]);

        // In-flight reimbursements must NOT enter the chart
        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('pieCharts.reimburse_by_category.total', 0)
                ->where('reimburseRate.current_approved_amount', 0)
                ->where('reimburseRate.current_total_count', 0)
            );

        // Now create a paid reimbursement
        ReimbursementRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'category' => 'Meals',
            'title' => 'Makan Malam Lembur',
            'description' => 'Makan lembur closing',
            'amount' => 150_000,
            'status' => 'paid',
            'approved_at' => now(),
            'processed_at' => now(),
            'created_at' => now(),
        ]);

        // Paid reimbursement MUST enter the chart
        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('pieCharts.reimburse_by_category.total', 150000)
                ->where('reimburseRate.current_approved_amount', 150000)
                ->where('reimburseRate.current_total_count', 1)
            );
    }

    public function test_payroll_by_division_is_sorted_high_to_low(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $divSmall = Division::query()->create(['user_id' => $user->id, 'name' => 'Divisi Kecil', 'code' => 'SML']);
        $divLarge = Division::query()->create(['user_id' => $user->id, 'name' => 'Divisi Terbesar', 'code' => 'LRG']);
        $divMedium = Division::query()->create(['user_id' => $user->id, 'name' => 'Divisi Sedang', 'code' => 'MED']);

        $empSmall = Employee::factory()->create(['user_id' => $user->id, 'division_id' => $divSmall->id, 'is_active' => true]);
        $empLarge = Employee::factory()->create(['user_id' => $user->id, 'division_id' => $divLarge->id, 'is_active' => true]);
        $empMedium = Employee::factory()->create(['user_id' => $user->id, 'division_id' => $divMedium->id, 'is_active' => true]);

        $period = now()->format('Y-m');

        $run = PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => $period,
            'status' => 'draft',
            'is_locked' => true,
            'locked_at' => now(),
            'total_net_salary' => 60_000_000,
            'employees_count' => 3,
            'generated_at' => now(),
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $empSmall->id,
            'base_salary' => 5_000_000,
            'net_salary' => 5_000_000,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $empLarge->id,
            'base_salary' => 40_000_000,
            'net_salary' => 40_000_000,
        ]);

        PayrollItem::query()->create([
            'user_id' => $user->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $empMedium->id,
            'base_salary' => 15_000_000,
            'net_salary' => 15_000_000,
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('pieCharts.payroll_by_division.total', 60000000)
                ->where('pieCharts.payroll_by_division.divisions.0.name', 'Divisi Terbesar')
                ->where('pieCharts.payroll_by_division.divisions.0.amount', 40000000)
                ->where('pieCharts.payroll_by_division.divisions.1.name', 'Divisi Sedang')
                ->where('pieCharts.payroll_by_division.divisions.1.amount', 15000000)
                ->where('pieCharts.payroll_by_division.divisions.2.name', 'Divisi Kecil')
                ->where('pieCharts.payroll_by_division.divisions.2.amount', 5000000)
            );
    }

    public function test_pie_charts_include_cutoff_period_label_and_respect_cutoff(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        CompanySetting::query()->create([
            'user_id' => $user->id,
            'payroll_cutoff_day' => '25',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'is_active' => true,
        ]);

        // Reimbursement within cutoff (26 Sep - 25 Okt 2026) -> processed on 2026-10-10
        ReimbursementRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'category' => 'Travels',
            'title' => 'Tiket Dinas Cutoff',
            'description' => 'Tiket dinas ke cabang',
            'amount' => 750_000,
            'status' => 'paid',
            'processed_at' => '2026-10-10 10:00:00',
            'created_at' => '2026-10-09 10:00:00',
        ]);

        // Reimbursement outside cutoff for 2026-10 (e.g. 2026-10-28, belongs to next period)
        ReimbursementRequest::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'category' => 'Meals',
            'title' => 'Makan Lewat Cutoff',
            'description' => 'Makan malam luar cutoff',
            'amount' => 300_000,
            'status' => 'paid',
            'processed_at' => '2026-10-28 10:00:00',
            'created_at' => '2026-10-28 10:00:00',
        ]);

        $this->actingAs($user)
            ->get(route('dashboard', ['period' => '2026-10']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('pieCharts.payroll_by_division.period_label', '26 Sep - 25 Okt 2026')
                ->where('pieCharts.reimburse_by_category.period_label', '26 Sep - 25 Okt 2026')
                ->where('pieCharts.reimburse_by_category.total', 750000)
            );
    }

    public function test_dashboard_supports_quarter_and_semester_periods(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        // Test quarter filter
        $this->actingAs($user)
            ->get(route('dashboard', ['period' => '2026-Q4']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('filters.period', '2026-Q4')
                ->where('filters.period_type', 'quarter')
                ->has('availablePeriodOptions.quarter')
                ->has('availablePeriodOptions.semester')
                ->has('availablePeriodOptions.month')
            );

        // Test semester filter
        $this->actingAs($user)
            ->get(route('dashboard', ['period' => '2026-S1']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('filters.period', '2026-S1')
                ->where('filters.period_type', 'semester')
            );
    }
}
