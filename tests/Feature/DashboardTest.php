<?php

namespace Tests\Feature;

use App\Models\AttendanceCorrectionRequest;
use App\Models\ClientInvoice;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeDocument;
use App\Models\EmployeeSchedule;
use App\Models\JobVacancy;
use App\Models\LeaveRequest;
use App\Models\ManpowerRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\ShiftChangeRequest;
use App\Models\SubCompany;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

        PayrollRun::factory()->create([
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
                ->has('attendanceFocus.items', 5)
                ->has('recentRequests.items', 5)
                ->where('contractReminders.total', 2)
                ->has('contractReminders.items', 2)
                ->where('contractReminders.items.0.type', 'Probation')
                ->where('contractReminders.items.1.type', 'Kontrak')
            );
    }
}
