<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeLeaveBalance;
use App\Models\SubCompany;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
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

    public function test_attendance_page_returns_source_timezone_with_iso_timestamps(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $attendance = EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-06-08',
            'timezone' => 'Asia/Jakarta',
            'check_in_at' => '2026-06-08 01:30:00',
            'check_out_at' => '2026-06-08 10:00:00',
        ]);

        $this->actingAs($user)
            ->get(route('hris.attendances.index', ['date' => '2026-06-08']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/attendances/index')
                ->where('attendances.data.0.id', $attendance->id)
                ->where('attendances.data.0.timezone', 'Asia/Jakarta')
                ->where('attendances.data.0.check_in_at', '2026-06-08T01:30:00+00:00')
                ->where('attendances.data.0.check_out_at', '2026-06-08T10:00:00+00:00')
            );
    }

    public function test_admin_can_view_monthly_attendance_for_one_employee(): void
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

        $otherEmployee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $present = EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-06-08',
            'status' => 'present',
            'check_in_at' => '2026-06-08 01:00:00',
            'check_out_at' => '2026-06-08 09:00:00',
        ]);

        $late = EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-06-09',
            'status' => 'late',
            'check_in_at' => '2026-06-09 01:30:00',
            'check_out_at' => '2026-06-09 09:00:00',
        ]);

        EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-07-01',
            'status' => 'absent',
        ]);

        EmployeeAttendance::factory()->create([
            'user_id' => $user->id,
            'employee_id' => $otherEmployee->id,
            'attendance_date' => '2026-06-08',
            'status' => 'absent',
        ]);

        $this->actingAs($user)
            ->get("/hris/attendances/employees/{$employee->id}/monthly?period=2026-06")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/attendances/monthly')
                ->where('employee.id', $employee->id)
                ->where('employee.label', 'EMP-001 - Ayu Lestari')
                ->where('filters.period', '2026-06')
                ->where('summary.total', 30)
                ->where('summary.present', 1)
                ->where('summary.late', 1)
                ->where('summary.on_leave', 0)
                ->where('summary.absent', 28)
                ->has('attendances', 30)
                ->where('attendances.0.id', null)
                ->where('attendances.0.attendance_date', '2026-06-01')
                ->where('attendances.0.status', 'absent')
                ->where('attendances.0.is_missing', true)
                ->where('attendances.7.id', $present->id)
                ->where('attendances.7.check_in_at', '2026-06-08T01:00:00+00:00')
                ->where('attendances.7.is_missing', false)
                ->where('attendances.8.id', $late->id)
            );
    }

    public function test_attendance_input_from_device_timezone_is_stored_as_utc(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->actingAs($user)
            ->post(route('hris.attendances.store'), [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-06-08',
                'status' => 'present',
                'check_in_at' => '2026-06-08T09:30',
                'check_out_at' => '2026-06-08T18:00',
                'timezone' => 'Asia/Makassar',
            ])
            ->assertRedirect();

        $attendance = EmployeeAttendance::query()->firstOrFail();

        $this->assertSame('2026-06-08 01:30:00', $attendance->check_in_at?->format('Y-m-d H:i:s'));
        $this->assertSame('2026-06-08 10:00:00', $attendance->check_out_at?->format('Y-m-d H:i:s'));
        $this->assertSame('Asia/Makassar', $attendance->timezone);
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

    public function test_leave_balances_exclude_inactive_and_resigned_employees(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $activeEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-ACTIVE',
            'employment_status' => 'active',
            'is_active' => true,
        ]);
        Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-INACTIVE',
            'employment_status' => 'active',
            'is_active' => false,
        ]);
        Employee::factory()->create([
            'user_id' => $user->id,
            'employee_code' => 'EMP-RESIGNED',
            'employment_status' => 'resigned',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('hris.leaves.balances.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('balances', 1)
                ->where('balances.0.employee_id', $activeEmployee->id)
                ->has('employees', 1)
                ->where('employees.0.id', $activeEmployee->id)
            );

        $this->actingAs($user)
            ->get(route('hris.leaves.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('employees', 1)
                ->where('employees.0.id', $activeEmployee->id)
            );

        $this->actingAs($user)
            ->get(route('hris.leave-approvals.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('employees', 1)
                ->where('employees.0.id', $activeEmployee->id)
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

    public function test_roster_shift_can_be_generated_for_selected_employees(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $firstEmployee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);
        $secondEmployee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);
        $unselectedEmployee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->seedWorkShifts($user);

        $this->actingAs($user)->post(route('hris.schedules.roster'), [
            'apply_scope' => 'selected',
            'target_employee_ids' => [$firstEmployee->id, $secondEmployee->id],
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-02',
            'pattern' => ['0817', 'OFF'],
        ])->assertRedirect();

        foreach ([$firstEmployee, $secondEmployee] as $employee) {
            $this->assertDatabaseHas('employee_schedules', [
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'work_date' => '2026-02-01',
                'shift_code' => '0817',
                'is_day_off' => false,
            ]);

            $this->assertDatabaseHas('employee_schedules', [
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'work_date' => '2026-02-02',
                'shift_code' => 'OFF',
                'is_day_off' => true,
            ]);
        }

        $this->assertDatabaseMissing('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $unselectedEmployee->id,
            'work_date' => '2026-02-01',
        ]);
    }

    public function test_roster_shift_can_be_generated_for_all_account_employees_only(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $otherUser = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $firstEmployee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);
        $secondEmployee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);
        $otherEmployee = Employee::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $this->seedWorkShifts($user);
        $this->seedWorkShifts($otherUser);

        $this->actingAs($user)->post(route('hris.schedules.roster'), [
            'apply_scope' => 'all',
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-01',
            'pattern' => ['0918'],
        ])->assertRedirect();

        foreach ([$firstEmployee, $secondEmployee] as $employee) {
            $this->assertDatabaseHas('employee_schedules', [
                'user_id' => $user->id,
                'employee_id' => $employee->id,
                'work_date' => '2026-02-01',
                'shift_code' => '0918',
                'is_day_off' => false,
            ]);
        }

        $this->assertDatabaseMissing('employee_schedules', [
            'user_id' => $otherUser->id,
            'employee_id' => $otherEmployee->id,
            'work_date' => '2026-02-01',
        ]);
    }

    public function test_holiday_sync_stores_holidays_and_sets_selected_employee_schedule_to_off(): void
    {
        Http::fake([
            'https://libur.deno.dev/api' => Http::response([
                [
                    'date' => '2026-03-18',
                    'name' => 'Cuti Bersama Hari Suci Nyepi Tahun Baru Saka 1948',
                    'is_national_holiday' => false,
                ],
                [
                    'date' => '2026-03-19',
                    'name' => 'Hari Suci Nyepi Tahun Baru Saka 1948',
                    'is_national_holiday' => true,
                ],
                [
                    'date' => '2026-04-03',
                    'name' => 'Wafat Yesus Kristus / Jumat Agung',
                    'is_national_holiday' => true,
                ],
            ]),
        ]);

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->seedWorkShifts($user);

        $this->actingAs($user)->post(route('hris.schedules.holidays.sync'), [
            'month' => '2026-03',
            'employee_id' => $employee->id,
        ])->assertRedirect();

        $this->assertDatabaseHas('public_holidays', [
            'user_id' => $user->id,
            'date' => '2026-03-18',
            'name' => 'Cuti Bersama Hari Suci Nyepi Tahun Baru Saka 1948',
            'is_national_holiday' => false,
        ]);

        $this->assertDatabaseHas('public_holidays', [
            'user_id' => $user->id,
            'date' => '2026-03-19',
            'name' => 'Hari Suci Nyepi Tahun Baru Saka 1948',
            'is_national_holiday' => true,
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-03-18',
            'shift_code' => 'OFF',
            'is_day_off' => true,
            'notes' => 'Cuti Bersama Hari Suci Nyepi Tahun Baru Saka 1948',
        ]);

        $this->assertDatabaseHas('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-03-19',
            'shift_code' => 'OFF',
            'is_day_off' => true,
            'notes' => 'Hari Suci Nyepi Tahun Baru Saka 1948',
        ]);

        $this->assertDatabaseMissing('employee_schedules', [
            'user_id' => $user->id,
            'employee_id' => $employee->id,
            'work_date' => '2026-04-03',
        ]);

        Http::assertSent(fn ($request): bool => $request->url() === 'https://libur.deno.dev/api');
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

    public function test_deleted_default_shift_is_not_recreated_on_schedule_reload()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('hris.schedules.index'))
            ->assertOk();

        $shift = WorkShift::query()
            ->where('user_id', $user->id)
            ->where('code', '0817')
            ->firstOrFail();

        $this->actingAs($user)
            ->delete(route('hris.schedules.shifts.destroy', $shift))
            ->assertRedirect()
            ->assertSessionHas('success', 'Shift berhasil dihapus.');

        $this->assertDatabaseMissing('work_shifts', [
            'user_id' => $user->id,
            'code' => '0817',
        ]);

        $this->actingAs($user)
            ->get(route('hris.schedules.index'))
            ->assertOk();

        $this->assertDatabaseMissing('work_shifts', [
            'user_id' => $user->id,
            'code' => '0817',
        ]);
    }

    private function seedWorkShifts(User $user): void
    {
        foreach ([
            ['code' => 'OFF', 'name' => 'OFF', 'start_time' => null, 'end_time' => null, 'is_day_off' => true],
            ['code' => '0817', 'name' => '0817', 'start_time' => '08:00', 'end_time' => '17:00', 'is_day_off' => false],
            ['code' => '0918', 'name' => '0918', 'start_time' => '09:00', 'end_time' => '18:00', 'is_day_off' => false],
        ] as $shift) {
            WorkShift::query()->firstOrCreate(
                [
                    'user_id' => $user->id,
                    'code' => $shift['code'],
                ],
                [
                    'name' => $shift['name'],
                    'start_time' => $shift['start_time'],
                    'end_time' => $shift['end_time'],
                    'is_day_off' => $shift['is_day_off'],
                    'late_tolerance_minutes' => 15,
                ],
            );
        }
    }
}
