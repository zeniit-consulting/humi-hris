<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeLeaveBalance;
use App\Models\SubCompany;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WorkforceModulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_users_can_open_attendance_schedule_leave_and_overtime_pages()
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)->get(route('hris.attendances.index'))->assertOk();
        $this->actingAs($user)->get(route('hris.schedules.index'))->assertOk();
        $this->actingAs($user)->get(route('hris.leaves.index'))->assertOk();
        $this->actingAs($user)->get(route('hris.overtimes.index'))->assertOk();
    }

    public function test_leave_balances_page_can_be_opened()
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-001',
            'first_name' => 'Ayu',
            'last_name' => 'Lestari',
        ]);

        EmployeeLeaveBalance::query()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'year' => now()->year,
            'policy_type' => 'lump_sum',
            'total_quota' => 12,
            'accrued_days' => 12,
            'used_days' => 2,
            'adjusted_days' => 0,
        ]);

        $this->actingAs($user)
            ->get(route('hris.leaves.balances.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/leaves/balances')
                ->where('leave_type', 'annual')
                ->has('balances', 1)
                ->where('balances.0.employee_id', $employee->id)
                ->where('balances.0.has_balance', true)
                ->where('balances.0.remaining_balance', 10)
            );
    }

    public function test_sub_user_leave_balances_are_limited_to_linked_sub_companies()
    {
        $this->withoutVite();

        $admin = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $visibleCompany = SubCompany::query()->create([
            'user_id' => $admin->id,
            'code' => 'SUB-A',
            'name' => 'Sub A',
        ]);
        $hiddenCompany = SubCompany::query()->create([
            'user_id' => $admin->id,
            'code' => 'SUB-B',
            'name' => 'Sub B',
        ]);

        $subUser = User::factory()->create([
            'parent_user_id' => $admin->id,
            'role' => 'admin_staff',
            'client_sub_company_id' => $visibleCompany->id,
            'email_verified_at' => now(),
        ]);
        $subUser->clientSubCompanies()->attach($visibleCompany->id);

        $visibleEmployee = Employee::factory()->create([
            'user_id' => $admin->id,
            'sub_company_id' => $visibleCompany->id,
            'employee_code' => 'EMP-001',
            'first_name' => 'Budi',
            'last_name' => 'Santoso',
        ]);
        $hiddenEmployee = Employee::factory()->create([
            'user_id' => $admin->id,
            'sub_company_id' => $hiddenCompany->id,
            'employee_code' => 'EMP-002',
            'first_name' => 'Citra',
            'last_name' => 'Dewi',
        ]);

        foreach ([$visibleEmployee, $hiddenEmployee] as $employee) {
            EmployeeLeaveBalance::query()->create([
                'user_id' => $admin->id,
                'employee_id' => $employee->id,
                'leave_type' => 'annual',
                'year' => now()->year,
                'policy_type' => 'lump_sum',
                'total_quota' => 12,
                'accrued_days' => 12,
                'used_days' => 0,
                'adjusted_days' => 0,
            ]);
        }

        $this->actingAs($subUser)
            ->get(route('hris.leaves.balances.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/leaves/balances')
                ->has('balances', 1)
                ->where('balances.0.employee_id', $visibleEmployee->id)
                ->has('employees', 1)
                ->where('employees.0.id', $visibleEmployee->id)
            );
    }

    public function test_monthly_schedule_can_be_saved_per_employee()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->seedWorkShifts($user);

        $response = $this->actingAs($user)->post(route('hris.attendances.schedules.store'), [
            'employee_id' => $employee->id,
            'month' => '2026-02',
            'entries' => [
                [
                    'date' => '2026-02-02',
                    'shift_code' => '0817',
                    'start_time' => '08:00',
                    'end_time' => '17:00',
                    'is_day_off' => false,
                    'notes' => null,
                ],
                [
                    'date' => '2026-02-03',
                    'shift_code' => 'OFF',
                    'start_time' => null,
                    'end_time' => null,
                    'is_day_off' => true,
                    'notes' => 'Libur mingguan',
                ],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('employee_schedules', [
            'employee_id' => $employee->id,
            'work_date' => '2026-02-02',
            'shift_code' => '0817',
            'is_day_off' => false,
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'employee_id' => $employee->id,
            'work_date' => '2026-02-03',
            'shift_code' => 'OFF',
            'is_day_off' => true,
        ]);
    }

    public function test_leave_and_overtime_records_can_be_created()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->actingAs($user)->post(route('hris.leaves.store'), [
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'start_date' => '2026-02-10',
            'end_date' => '2026-02-12',
            'reason' => 'Family event',
            'status' => 'approved',
            'rejection_reason' => null,
        ])->assertRedirect();

        $this->assertDatabaseHas('leave_requests', [
            'employee_id' => $employee->id,
            'leave_type' => 'annual',
            'total_days' => 3,
            'status' => 'approved',
        ]);

        $this->actingAs($user)->post(route('hris.overtimes.store'), [
            'employee_id' => $employee->id,
            'work_date' => '2026-02-15',
            'start_time' => '18:00',
            'end_time' => '21:00',
            'break_minutes' => 30,
            'reason' => 'Production release',
            'status' => 'approved',
            'notes' => null,
        ])->assertRedirect();

        $this->assertDatabaseHas('overtime_requests', [
            'employee_id' => $employee->id,
            'total_hours' => 2.5,
            'status' => 'approved',
        ]);
    }

    public function test_roster_shift_can_be_generated_for_date_range()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->seedWorkShifts($user);

        $this->actingAs($user)->post(route('hris.schedules.roster'), [
            'employee_id' => $employee->id,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-04',
            'pattern' => ['0817', '0918', 'OFF'],
        ])->assertRedirect();

        $this->assertDatabaseHas('employee_schedules', [
            'employee_id' => $employee->id,
            'work_date' => '2026-02-01',
            'shift_code' => '0817',
            'is_day_off' => false,
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'employee_id' => $employee->id,
            'work_date' => '2026-02-02',
            'shift_code' => '0918',
            'is_day_off' => false,
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'employee_id' => $employee->id,
            'work_date' => '2026-02-03',
            'shift_code' => 'OFF',
            'is_day_off' => true,
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'employee_id' => $employee->id,
            'work_date' => '2026-02-04',
            'shift_code' => '0817',
            'is_day_off' => false,
        ]);
    }

    public function test_shift_master_can_be_created_from_schedule_popup()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)->post(route('hris.schedules.shifts.store'), [
            'start_time' => '10:00',
            'end_time' => '19:00',
        ])->assertRedirect();

        $this->assertDatabaseHas('work_shifts', [
            'user_id' => $user->id,
            'code' => '1019',
            'name' => '1019',
            'start_time' => '10:00',
            'end_time' => '19:00',
            'is_day_off' => false,
        ]);
    }

    private function seedWorkShifts(User $user): void
    {
        foreach ([
            ['code' => 'OFF', 'name' => 'OFF', 'start_time' => null, 'end_time' => null, 'is_day_off' => true],
            ['code' => '0817', 'name' => '0817', 'start_time' => '08:00', 'end_time' => '17:00', 'is_day_off' => false],
            ['code' => '0918', 'name' => '0918', 'start_time' => '09:00', 'end_time' => '18:00', 'is_day_off' => false],
        ] as $shift) {
            WorkShift::query()->create([
                'user_id' => $user->id,
                'code' => $shift['code'],
                'name' => $shift['name'],
                'start_time' => $shift['start_time'],
                'end_time' => $shift['end_time'],
                'is_day_off' => $shift['is_day_off'],
            ]);
        }
    }
}
