<?php

namespace Tests\Feature\Api;

use App\Models\CompanySetting;
use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeBankAccount;
use App\Models\EmployeeDeduction;
use App\Models\EmployeeSchedule;
use App\Models\PayrollItem;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\SubCompany;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MobileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_login_returns_token_and_authenticated_user_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'mobile@example.com',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);

        $loginResponse = $this->postJson('/api/mobile/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'android-test',
        ]);

        $loginResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'token_type',
                    'access_token',
                    'user' => ['id', 'name', 'email', 'role', 'account_owner_id'],
                ],
            ]);

        $token = $loginResponse->json('data.access_token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/mobile/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_mobile_api_requires_sanctum_token_for_protected_endpoints(): void
    {
        $this->getJson('/api/mobile/v1/employees')
            ->assertUnauthorized();
    }

    public function test_mobile_employee_list_for_sub_user_only_returns_linked_sub_company_employees(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'parent_user_id' => $owner->id,
            'role' => 'staff',
            'email_verified_at' => now(),
        ]);

        $otherOwner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $ownerDivision = Division::factory()->create([
            'user_id' => $owner->id,
            'name' => 'Owner Division',
        ]);

        $ownerPosition = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $ownerDivision->id,
            'name' => 'Owner Position',
            'level' => '2',
        ]);

        $linkedCompany = SubCompany::query()->create([
            'user_id' => $owner->id,
            'code' => 'SUB-A',
            'name' => 'Sub A',
        ]);

        $unlinkedCompany = SubCompany::query()->create([
            'user_id' => $owner->id,
            'code' => 'SUB-B',
            'name' => 'Sub B',
        ]);

        $subUser->clientSubCompanies()->attach($linkedCompany->id);

        Employee::factory()->create([
            'user_id' => $owner->id,
            'created_by_user_id' => $owner->id,
            'sub_company_id' => null,
            'division_id' => $ownerDivision->id,
            'position_id' => $ownerPosition->id,
            'employee_code' => 'EMP-OWN1',
            'first_name' => 'Owner',
            'last_name' => 'Employee',
        ]);

        $subUserEmployee = Employee::factory()->create([
            'user_id' => $owner->id,
            'created_by_user_id' => $subUser->id,
            'sub_company_id' => $linkedCompany->id,
            'division_id' => $ownerDivision->id,
            'position_id' => $ownerPosition->id,
            'employee_code' => 'EMP-SUB1',
            'first_name' => 'Sub',
            'last_name' => 'Employee',
        ]);

        Employee::factory()->create([
            'user_id' => $owner->id,
            'created_by_user_id' => $subUser->id,
            'sub_company_id' => $unlinkedCompany->id,
            'division_id' => $ownerDivision->id,
            'position_id' => $ownerPosition->id,
            'employee_code' => 'EMP-SUB2',
            'first_name' => 'Unlinked',
            'last_name' => 'Employee',
        ]);

        $otherDivision = Division::factory()->create([
            'user_id' => $otherOwner->id,
            'name' => 'Other Division',
        ]);

        $otherPosition = Position::factory()->create([
            'user_id' => $otherOwner->id,
            'division_id' => $otherDivision->id,
            'name' => 'Other Position',
            'level' => '2',
        ]);

        Employee::factory()->create([
            'user_id' => $otherOwner->id,
            'division_id' => $otherDivision->id,
            'position_id' => $otherPosition->id,
            'employee_code' => 'EMP-OTH1',
            'first_name' => 'Other',
            'last_name' => 'Employee',
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $response = $this->getJson('/api/mobile/v1/employees');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.id', $subUserEmployee->id)
            ->assertJsonPath('data.items.0.employee_code', 'EMP-SUB1');
    }

    public function test_self_service_payroll_preview_only_returns_the_logged_in_employee_item(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $selfEmployee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'staff@example.com',
        ]);

        $otherEmployee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'other@example.com',
        ]);

        $run = PayrollRun::factory()->create([
            'user_id' => $owner->id,
            'period' => now()->format('Y-m'),
        ]);

        PayrollItem::query()->create([
            'user_id' => $owner->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $selfEmployee->id,
            'base_salary' => 5000000,
            'allowances_total' => 250000,
            'kasbon_deduction' => 0,
            'denda_deduction' => 0,
            'deductions_total' => 0,
            'net_salary' => 5250000,
            'allowance_breakdown' => [],
        ]);

        PayrollItem::query()->create([
            'user_id' => $owner->id,
            'payroll_run_id' => $run->id,
            'employee_id' => $otherEmployee->id,
            'base_salary' => 8000000,
            'allowances_total' => 500000,
            'kasbon_deduction' => 0,
            'denda_deduction' => 0,
            'deductions_total' => 0,
            'net_salary' => 8500000,
            'allowance_breakdown' => [],
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->getJson('/api/mobile/v1/payrolls/preview?period='.now()->format('Y-m'))
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.employee_id', $selfEmployee->id);
    }

    public function test_self_service_user_can_update_personal_identity_profile(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $portalUser = User::factory()->create([
            'email' => 'portal+employee-self@local.portal',
            'phone' => '081234567890',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => null,
            'phone' => '081234567890',
            'address' => 'Alamat lama',
        ]);

        Sanctum::actingAs($portalUser, ['mobile']);

        $response = $this->putJson('/api/mobile/v1/profile', [
            'phone' => '081234567891',
            'address' => 'Jl. Mandiri No. 10',
            'gender' => 'female',
            'birth_date' => '1996-08-17',
            'last_education' => 'S1',
            'marital_status' => 'married',
            'children_count' => 2,
            'family_card_number' => '3174091708960001',
            'ktp_number' => '3174095708960001',
            'bpjs_kesehatan_number' => '0001234567890',
            'bpjs_ketenagakerjaan_number' => '19001234567',
            'sim_a_number' => 'SIM-A-001',
            'sim_b_number' => 'SIM-B-001',
            'sim_c_number' => 'SIM-C-001',
            'biological_mother_name' => 'Siti Aminah',
            'emergency_contact_name' => 'Budi Santoso',
            'emergency_contact_phone' => '081298765432',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.phone', '081234567891')
            ->assertJsonPath('data.address', 'Jl. Mandiri No. 10')
            ->assertJsonPath('data.gender', 'female')
            ->assertJsonPath('data.ktp_number', '3174095708960001')
            ->assertJsonPath('data.bpjs_kesehatan_number', '0001234567890')
            ->assertJsonPath('data.sim_c_number', 'SIM-C-001');

        $employee->refresh();

        $this->assertSame('female', $employee->gender);
        $this->assertSame('1996-08-17', $employee->birth_date?->format('Y-m-d'));
        $this->assertSame('S1', $employee->last_education);
        $this->assertSame('married', $employee->marital_status);
        $this->assertSame(2, $employee->children_count);
        $this->assertSame('3174091708960001', $employee->family_card_number);
        $this->assertSame('3174095708960001', $employee->ktp_number);
        $this->assertSame('0001234567890', $employee->bpjs_kesehatan_number);
        $this->assertSame('19001234567', $employee->bpjs_ketenagakerjaan_number);
        $this->assertSame('SIM-A-001', $employee->sim_a_number);
        $this->assertSame('SIM-B-001', $employee->sim_b_number);
        $this->assertSame('SIM-C-001', $employee->sim_c_number);
        $this->assertSame('Siti Aminah', $employee->biological_mother_name);
        $this->assertSame('Budi Santoso', $employee->emergency_contact_name);
        $this->assertSame('081298765432', $employee->emergency_contact_phone);

        $this->assertSame('081234567891', $portalUser->refresh()->phone);

        $this->getJson('/api/mobile/v1/profile')
            ->assertOk()
            ->assertJsonPath('data.employee.id', $employee->id)
            ->assertJsonPath('data.employee.phone', '081234567891');
    }

    public function test_profile_show_includes_self_service_completion_checklist(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $portalUser = User::factory()->create([
            'email' => 'portal+incomplete@local.portal',
            'phone' => '081234567890',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => null,
            'phone' => '081234567890',
            'address' => null,
            'ktp_number' => null,
            'bpjs_kesehatan_number' => null,
            'bpjs_ketenagakerjaan_number' => null,
            'emergency_contact_name' => null,
            'emergency_contact_phone' => null,
        ]);

        Sanctum::actingAs($portalUser, ['mobile']);

        $this->getJson('/api/mobile/v1/profile')
            ->assertOk()
            ->assertJsonPath('data.profile_completion.total', 5)
            ->assertJsonPath('data.profile_completion.completed', 1)
            ->assertJsonPath('data.profile_completion.missing_count', 4)
            ->assertJsonPath('data.profile_completion.items.0.key', 'personal_identity')
            ->assertJsonPath('data.profile_completion.items.0.complete', false)
            ->assertJsonPath('data.profile_completion.items.4.key', 'bank_account')
            ->assertJsonPath('data.profile_completion.items.4.complete', false);

        EmployeeBankAccount::factory()->create([
            'employee_id' => $employee->id,
            'is_primary' => true,
        ]);

        $employee->update([
            'address' => 'Jl. Lengkap No. 1',
            'ktp_number' => '3174095708960001',
            'bpjs_kesehatan_number' => '0001234567890',
            'bpjs_ketenagakerjaan_number' => '19001234567',
            'emergency_contact_name' => 'Budi Santoso',
            'emergency_contact_phone' => '081298765432',
        ]);

        $this->getJson('/api/mobile/v1/profile')
            ->assertOk()
            ->assertJsonPath('data.profile_completion.completed', 5)
            ->assertJsonPath('data.profile_completion.missing_count', 0)
            ->assertJsonPath('data.profile_completion.percent', 100);
    }

    public function test_portal_summary_does_not_show_yesterday_open_attendance_as_today(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'staff@example.com',
        ]);

        $shift = WorkShift::query()->create([
            'user_id' => $owner->id,
            'code' => 'SHIFT-1',
            'name' => 'Pagi',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => today()->subDay()->toDateString(),
            'status' => 'present',
            'check_in_at' => today()->subDay()->setTime(8, 5),
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.8,
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $response = $this->getJson('/api/mobile/v1/portal/summary');

        $response
            ->assertOk()
            ->assertJsonPath('data.quick_action.attendance', null)
            ->assertJsonPath('data.quick_action.open_attendance', null)
            ->assertJsonPath('data.quick_action.can_clock_in', true)
            ->assertJsonPath('data.quick_action.can_clock_out', false);

        $this->assertTrue(
            collect($response->json('data.shift_options'))->contains('id', $shift->id),
        );
    }

    public function test_portal_summary_exposes_today_open_attendance(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'today-open@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'today-open@example.com',
        ]);

        $shift = WorkShift::query()->create([
            'user_id' => $owner->id,
            'code' => 'SHIFT-1',
            'name' => 'Pagi',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        $attendance = EmployeeAttendance::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => today()->toDateString(),
            'status' => 'present',
            'check_in_at' => today()->setTime(8, 5),
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.8,
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->getJson('/api/mobile/v1/portal/summary')
            ->assertOk()
            ->assertJsonPath('data.quick_action.can_clock_out', true)
            ->assertJsonPath('data.quick_action.open_attendance.id', $attendance->id);
    }

    public function test_portal_summary_keeps_yesterday_open_attendance_for_active_overnight_shift(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-05-20 02:00:00', 'Asia/Makassar'));

        try {
            $owner = User::factory()->create([
                'email_verified_at' => now(),
            ]);

            $subUser = User::factory()->create([
                'email' => 'night-shift@example.com',
                'parent_user_id' => $owner->id,
                'role' => 'user',
                'email_verified_at' => now(),
            ]);

            $division = Division::factory()->create([
                'user_id' => $owner->id,
            ]);

            $position = Position::factory()->create([
                'user_id' => $owner->id,
                'division_id' => $division->id,
                'level' => '2',
            ]);

            $employee = Employee::factory()->create([
                'user_id' => $owner->id,
                'division_id' => $division->id,
                'position_id' => $position->id,
                'email' => 'night-shift@example.com',
            ]);

            $shift = WorkShift::query()->create([
                'user_id' => $owner->id,
                'code' => '2103',
                'name' => 'Malam',
                'start_time' => '21:00:00',
                'end_time' => '03:00:00',
                'is_day_off' => false,
            ]);

            $attendance = EmployeeAttendance::query()->create([
                'user_id' => $owner->id,
                'employee_id' => $employee->id,
                'shift_id' => $shift->id,
                'attendance_date' => '2026-05-19',
                'status' => 'present',
                'check_in_at' => Carbon::parse('2026-05-19 21:00:00', 'Asia/Makassar')->utc(),
                'check_out_at' => null,
            ]);

            Sanctum::actingAs($subUser, ['mobile']);

            $this->withHeader('X-Timezone', 'Asia/Makassar')
                ->getJson('/api/mobile/v1/portal/summary')
                ->assertOk()
                ->assertJsonPath('data.quick_action.can_clock_in', false)
                ->assertJsonPath('data.quick_action.can_clock_out', true)
                ->assertJsonPath('data.quick_action.open_attendance.id', $attendance->id)
                ->assertJsonPath('data.quick_action.open_attendance.shift.code', '2103');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_portal_summary_handles_scheduled_employee_full_name_accessor(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'staff@example.com',
            'first_name' => 'Staff',
            'last_name' => 'Portal',
        ]);

        EmployeeSchedule::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'work_date' => today()->toDateString(),
            'shift_code' => 'SHIFT-1',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->getJson('/api/mobile/v1/portal/summary')
            ->assertOk()
            ->assertJsonPath('data.employee.full_name', 'Staff Portal')
            ->assertJsonPath('data.quick_action.shift.code', 'SHIFT-1');
    }

    public function test_self_service_clock_in_can_be_stored_without_configured_shift(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'staff@example.com',
        ]);

        WorkShift::query()->where('user_id', $owner->id)->delete();

        Sanctum::actingAs($subUser, ['mobile']);

        $this->postJson('/api/mobile/v1/attendances', [
            'employee_id' => $employee->id,
            'shift_id' => null,
            'attendance_date' => today()->toDateString(),
            'status' => 'present',
            'check_in_at' => today()->setTime(8, 0)->toIso8601String(),
            'check_in_latitude' => -6.20001,
            'check_in_longitude' => 106.81667,
        ])
            ->assertCreated()
            ->assertJsonPath('data.shift', null);

        $attendance = EmployeeAttendance::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', today()->toDateString())
            ->firstOrFail();

        $this->assertNull($attendance->shift_id);
    }

    public function test_wfa_employee_can_clock_in_outside_the_company_radius(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $portalUser = User::factory()->create([
            'email' => 'wfa.employee@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => $portalUser->email,
            'is_wfa' => true,
        ]);

        CompanySetting::query()->create([
            'user_id' => $owner->id,
            'name' => 'Humi',
            'location_name' => 'Kantor Utama',
            'location_latitude' => -6.2000000,
            'location_longitude' => 106.8166667,
            'attendance_radius_meters' => 100,
        ]);

        Sanctum::actingAs($portalUser, ['mobile']);

        $this->postJson('/api/mobile/v1/attendances', [
            'employee_id' => $employee->id,
            'attendance_date' => today()->toDateString(),
            'status' => 'present',
            'check_in_at' => today()->setTime(8, 0)->toIso8601String(),
            'check_in_latitude' => -8.6500000,
            'check_in_longitude' => 115.2166667,
        ])
            ->assertCreated()
            ->assertJsonPath('data.check_in_latitude', '-8.6500000');

        $this->getJson('/api/mobile/v1/portal/summary')
            ->assertOk()
            ->assertJsonPath('data.attendance_policy.mode', 'wfa');
    }

    public function test_self_service_clock_in_detects_shift_when_today_schedule_is_missing(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'auto-shift@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'auto-shift@example.com',
        ]);

        WorkShift::query()->where('user_id', $owner->id)->delete();

        $morningShift = WorkShift::query()->create([
            'user_id' => $owner->id,
            'code' => '0817',
            'name' => 'Pagi',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
            'late_tolerance_minutes' => 15,
        ]);

        WorkShift::query()->create([
            'user_id' => $owner->id,
            'code' => '1322',
            'name' => 'Siang',
            'start_time' => '13:00:00',
            'end_time' => '22:00:00',
            'is_day_off' => false,
            'late_tolerance_minutes' => 15,
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->withHeader('X-Timezone', 'Asia/Makassar')
            ->postJson('/api/mobile/v1/attendances', [
                'employee_id' => $employee->id,
                'shift_id' => null,
                'attendance_date' => '2026-05-19',
                'status' => 'present',
                'check_in_at' => '2026-05-19T09:30:00',
                'check_in_latitude' => -6.20001,
                'check_in_longitude' => 106.81667,
            ])
            ->assertCreated()
            ->assertJsonPath('data.shift.id', $morningShift->id)
            ->assertJsonPath('data.shift.code', '0817');

        $this->assertDatabaseHas('employee_attendances', [
            'employee_id' => $employee->id,
            'shift_id' => $morningShift->id,
            'attendance_date' => '2026-05-19 00:00:00',
        ]);
    }

    public function test_self_service_can_clock_in_today_when_yesterday_was_not_clocked_out(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-05-20 09:00:00', 'Asia/Makassar'));

        try {
            $owner = User::factory()->create([
                'email_verified_at' => now(),
            ]);

            $subUser = User::factory()->create([
                'email' => 'forgot-checkout@example.com',
                'parent_user_id' => $owner->id,
                'role' => 'user',
                'email_verified_at' => now(),
            ]);

            $division = Division::factory()->create([
                'user_id' => $owner->id,
            ]);

            $position = Position::factory()->create([
                'user_id' => $owner->id,
                'division_id' => $division->id,
                'level' => '2',
            ]);

            $employee = Employee::factory()->create([
                'user_id' => $owner->id,
                'division_id' => $division->id,
                'position_id' => $position->id,
                'email' => 'forgot-checkout@example.com',
            ]);

            EmployeeAttendance::query()->create([
                'user_id' => $owner->id,
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-19',
                'status' => 'present',
                'check_in_at' => Carbon::parse('2026-05-19 08:00:00', 'Asia/Makassar')->utc(),
                'check_out_at' => null,
            ]);

            Sanctum::actingAs($subUser, ['mobile']);

            $this->withHeader('X-Timezone', 'Asia/Makassar')
                ->postJson('/api/mobile/v1/attendances', [
                    'employee_id' => $employee->id,
                    'attendance_date' => '2026-05-20',
                    'status' => 'present',
                    'check_in_at' => '2026-05-20T09:00:00',
                    'check_in_latitude' => -6.20001,
                    'check_in_longitude' => 106.81667,
                ])
                ->assertCreated()
                ->assertJsonPath('data.attendance_date', '2026-05-20');

            $this->assertDatabaseHas('employee_attendances', [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-20 00:00:00',
            ]);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_self_service_clock_in_is_blocked_when_yesterday_overnight_shift_is_still_active(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'active-night-shift@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'active-night-shift@example.com',
        ]);

        $shift = WorkShift::query()->create([
            'user_id' => $owner->id,
            'code' => '2103',
            'name' => 'Malam',
            'start_time' => '21:00:00',
            'end_time' => '03:00:00',
            'is_day_off' => false,
        ]);

        EmployeeAttendance::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => '2026-05-19',
            'status' => 'present',
            'check_in_at' => Carbon::parse('2026-05-19 21:00:00', 'Asia/Makassar')->utc(),
            'check_out_at' => null,
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->withHeader('X-Timezone', 'Asia/Makassar')
            ->postJson('/api/mobile/v1/attendances', [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-20',
                'status' => 'present',
                'check_in_at' => '2026-05-20T02:00:00',
                'check_in_latitude' => -6.20001,
                'check_in_longitude' => 106.81667,
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Masih ada absensi yang belum clock out.');
    }

    public function test_self_service_kasbon_returns_limit_and_stores_own_request(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $selfEmployee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'staff@example.com',
            'base_salary' => 6_000_000,
        ]);

        $otherEmployee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'other@example.com',
            'base_salary' => 9_000_000,
        ]);

        EmployeeDeduction::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $selfEmployee->id,
            'type' => 'kasbon',
            'amount' => 500_000,
            'deduction_date' => today()->toDateString(),
            'notes' => 'Transport',
        ]);

        EmployeeDeduction::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $otherEmployee->id,
            'type' => 'kasbon',
            'amount' => 900_000,
            'deduction_date' => today()->toDateString(),
            'notes' => 'Other',
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->getJson('/api/mobile/v1/kasbons?period='.today()->format('Y-m'))
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.limit.max_amount', 3_000_000)
            ->assertJsonPath('data.limit.used_amount', 500_000)
            ->assertJsonPath('data.limit.available_amount', 2_500_000);

        $this->postJson('/api/mobile/v1/kasbons', [
            'employee_id' => $otherEmployee->id,
            'amount' => 1_000_000,
            'deduction_date' => today()->toDateString(),
            'notes' => 'Keperluan keluarga',
        ])
            ->assertCreated()
            ->assertJsonPath('data.employee_id', $selfEmployee->id);

        $this->assertDatabaseHas('employee_deductions', [
            'employee_id' => $selfEmployee->id,
            'type' => 'kasbon',
            'amount' => 1_000_000,
            'notes' => 'Keperluan keluarga',
        ]);
    }

    public function test_self_service_kasbon_blocks_amount_over_available_limit(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'staff@example.com',
            'base_salary' => 4_000_000,
        ]);

        EmployeeDeduction::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'type' => 'kasbon',
            'amount' => 1_500_000,
            'deduction_date' => today()->toDateString(),
            'notes' => 'Existing',
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->postJson('/api/mobile/v1/kasbons', [
            'employee_id' => $employee->id,
            'amount' => 600_000,
            'deduction_date' => today()->toDateString(),
            'notes' => 'Melebihi limit',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false);
    }

    public function test_self_service_attendance_flow_stores_location_and_updates_open_record(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'staff@example.com',
        ]);

        $shift = WorkShift::query()->create([
            'user_id' => $owner->id,
            'code' => 'SHIFT-1',
            'name' => 'Pagi',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $storeResponse = $this->postJson('/api/mobile/v1/attendances', [
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => today()->toDateString(),
            'status' => 'present',
            'check_in_at' => today()->setTime(8, 0)->toIso8601String(),
            'check_in_latitude' => -6.20001,
            'check_in_longitude' => 106.81667,
        ]);

        $storeResponse
            ->assertCreated()
            ->assertJsonPath('data.check_in_latitude', '-6.2000100');

        $attendance = EmployeeAttendance::query()->firstOrFail();

        $this->putJson('/api/mobile/v1/attendances/'.$attendance->id, [
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => today()->toDateString(),
            'status' => 'present',
            'check_in_at' => today()->setTime(8, 0)->toIso8601String(),
            'check_out_at' => today()->setTime(17, 0)->toIso8601String(),
            'check_out_latitude' => -6.20002,
            'check_out_longitude' => 106.81668,
        ])
            ->assertOk()
            ->assertJsonPath('data.check_out_latitude', '-6.2000200');

        $this->assertDatabaseCount('employee_attendances', 1);
        $this->assertDatabaseHas('employee_attendances', [
            'id' => $attendance->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
        ]);
    }

    public function test_self_service_attendance_uses_device_timezone_for_local_times(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'timezone-staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'timezone-staff@example.com',
            'timezone' => 'Asia/Jakarta',
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->withHeader('X-Timezone', 'Asia/Makassar')
            ->postJson('/api/mobile/v1/attendances', [
                'employee_id' => $employee->id,
                'attendance_date' => '2026-05-19',
                'status' => 'present',
                'check_in_at' => '2026-05-19T00:00:00.000Z',
                'check_in_latitude' => -6.20001,
                'check_in_longitude' => 106.81667,
            ])
            ->assertCreated()
            ->assertJsonPath('data.check_in_at', '2026-05-19T08:00:00+08:00');

        $attendance = EmployeeAttendance::query()->firstOrFail();

        $this->assertSame(
            '2026-05-19 00:00:00',
            $attendance->check_in_at?->format('Y-m-d H:i:s'),
        );
        $this->assertSame('Asia/Makassar', $attendance->timezone);

        $this->withHeader('X-Timezone', 'Asia/Jayapura')
            ->getJson('/api/mobile/v1/attendances?date=2026-05-19')
            ->assertOk()
            ->assertJsonPath('data.items.0.timezone', 'Asia/Makassar')
            ->assertJsonPath('data.items.0.check_in_at', '2026-05-19T08:00:00+08:00');
    }

    public function test_self_service_attendance_falls_back_to_employee_timezone(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'fallback-timezone@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create(['user_id' => $owner->id]);
        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '3',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'fallback-timezone@example.com',
            'timezone' => 'Asia/Jakarta',
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->postJson('/api/mobile/v1/attendances', [
            'employee_id' => $employee->id,
            'attendance_date' => '2026-05-20',
            'status' => 'present',
            'check_in_at' => '2026-05-20T08:00:00',
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.81667,
        ])
            ->assertCreated()
            ->assertJsonPath('data.timezone', 'Asia/Jakarta')
            ->assertJsonPath('data.check_in_at', '2026-05-20T08:00:00+07:00');

        $attendance = EmployeeAttendance::query()->firstOrFail();

        $this->assertSame('Asia/Jakarta', $attendance->timezone);
        $this->assertSame('2026-05-20 01:00:00', $attendance->check_in_at?->format('Y-m-d H:i:s'));
    }

    public function test_clock_out_is_blocked_after_three_days(): void
    {
        $owner = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $subUser = User::factory()->create([
            'email' => 'staff@example.com',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $division = Division::factory()->create([
            'user_id' => $owner->id,
        ]);

        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'level' => '2',
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'staff@example.com',
        ]);

        $shift = WorkShift::query()->create([
            'user_id' => $owner->id,
            'code' => 'SHIFT-1',
            'name' => 'Pagi',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'is_day_off' => false,
        ]);

        $attendance = EmployeeAttendance::query()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => Carbon::today()->subDays(4)->toDateString(),
            'status' => 'present',
            'check_in_at' => Carbon::today()->subDays(4)->setTime(8, 0),
            'check_in_latitude' => -6.2,
            'check_in_longitude' => 106.8,
        ]);

        Sanctum::actingAs($subUser, ['mobile']);

        $this->putJson('/api/mobile/v1/attendances/'.$attendance->id, [
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'attendance_date' => Carbon::today()->subDays(4)->toDateString(),
            'status' => 'present',
            'check_in_at' => Carbon::today()->subDays(4)->setTime(8, 0)->toIso8601String(),
            'check_out_at' => Carbon::today()->toIso8601String(),
            'check_out_latitude' => -6.20002,
            'check_out_longitude' => 106.81668,
        ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false);
    }
}
