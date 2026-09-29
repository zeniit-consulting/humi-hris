<?php

namespace Tests\Feature;

use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\SubCompany;
use App\Models\User;
use App\Models\WorkShift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackupAttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_toggle_backup_attendance_setting(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Default setting is true / enabled
        $this->assertTrue(CompanySetting::backupAttendanceEnabledFor($admin));

        // Disable setting
        $this->actingAs($admin)
            ->patch(route('settings.attendance.update'), [
                'missing_clock_out_request_days' => 2,
                'attendance_revision_cutoff_day' => 'end_of_month',
                'backup_attendance_enabled' => false,
            ])
            ->assertRedirect(route('settings.attendance.edit'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('company_settings', [
            'user_id' => $admin->id,
            'backup_attendance_enabled' => false,
        ]);

        $this->assertFalse(CompanySetting::backupAttendanceEnabledFor($admin));

        // Re-enable setting
        $this->actingAs($admin)
            ->patch(route('settings.attendance.update'), [
                'missing_clock_out_request_days' => 2,
                'attendance_revision_cutoff_day' => 'end_of_month',
                'backup_attendance_enabled' => true,
            ])
            ->assertRedirect(route('settings.attendance.edit'))
            ->assertSessionHasNoErrors();

        $this->assertTrue(CompanySetting::backupAttendanceEnabledFor($admin));
    }

    public function test_portal_backup_attendance_page_is_guarded_by_setting(): void
    {
        $this->withoutVite();

        $owner = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $owner->id,
            'email_verified_at' => now(),
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => $user->email,
        ]);
        $user->update(['employee_id' => $employee->id]);

        // When enabled, page returns 200
        CompanySetting::updateOrCreate(
            ['user_id' => $owner->id],
            ['backup_attendance_enabled' => true]
        );

        $this->actingAs($user)
            ->get(route('portal.backup-attendance'))
            ->assertOk();

        // When disabled, page returns 404
        CompanySetting::updateOrCreate(
            ['user_id' => $owner->id],
            ['backup_attendance_enabled' => false]
        );

        $this->actingAs($user)
            ->get(route('portal.backup-attendance'))
            ->assertNotFound();
    }

    public function test_colleagues_endpoint_returns_only_same_company_sub_company_active_employees(): void
    {
        $owner = User::factory()->create(['role' => 'admin']);
        CompanySetting::updateOrCreate(
            ['user_id' => $owner->id],
            ['backup_attendance_enabled' => true]
        );

        $subCompanyA = SubCompany::create([
            'user_id' => $owner->id,
            'name' => 'Sub Company A',
            'code' => 'SCA',
        ]);
        $subCompanyB = SubCompany::create([
            'user_id' => $owner->id,
            'name' => 'Sub Company B',
            'code' => 'SCB',
        ]);

        // User Y in SubCompany A
        $userY = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $owner->id,
            'email_verified_at' => now(),
        ]);
        $employeeY = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => $userY->email,
            'sub_company_id' => $subCompanyA->id,
            'employment_status' => 'permanent',
        ]);
        $userY->update(['employee_id' => $employeeY->id]);

        // Colleague X in SubCompany A (Eligible)
        $employeeX = Employee::factory()->create([
            'user_id' => $owner->id,
            'sub_company_id' => $subCompanyA->id,
            'employment_status' => 'permanent',
        ]);

        // Colleague Z in SubCompany B (Different sub company - Not eligible)
        $employeeZ = Employee::factory()->create([
            'user_id' => $owner->id,
            'sub_company_id' => $subCompanyB->id,
            'employment_status' => 'permanent',
        ]);

        // Colleague R in SubCompany A but resigned (Not eligible)
        $employeeR = Employee::factory()->create([
            'user_id' => $owner->id,
            'sub_company_id' => $subCompanyA->id,
            'employment_status' => 'resigned',
        ]);

        $response = $this->actingAs($userY)
            ->getJson(route('portal.api.backup-attendance.colleagues'))
            ->assertOk();

        $colleagueIds = collect($response->json('data.colleagues'))->pluck('id')->all();

        $this->assertContains($employeeX->id, $colleagueIds);
        $this->assertNotContains($employeeY->id, $colleagueIds); // Cannot backup self
        $this->assertNotContains($employeeZ->id, $colleagueIds); // Different sub company
        $this->assertNotContains($employeeR->id, $colleagueIds); // Resigned
    }

    public function test_user_can_perform_backup_check_in_and_check_out(): void
    {
        $owner = User::factory()->create(['role' => 'admin']);
        CompanySetting::updateOrCreate(
            ['user_id' => $owner->id],
            [
                'backup_attendance_enabled' => true,
                'location_latitude' => -6.200000,
                'location_longitude' => 106.816666,
                'attendance_radius_meters' => 5000,
            ]
        );

        $shift = WorkShift::create([
            'user_id' => $owner->id,
            'code' => 'REG',
            'name' => 'Regular Shift',
            'start_time' => '08:00',
            'end_time' => '17:00',
        ]);

        // User Y (The one working and doing the backup)
        $userY = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $owner->id,
            'email_verified_at' => now(),
        ]);
        $employeeY = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => $userY->email,
            'first_name' => 'Budi',
            'last_name' => 'Santoso',
            'sub_company_id' => null,
            'employment_status' => 'permanent',
            'is_wfa' => true,
        ]);
        $userY->update(['employee_id' => $employeeY->id]);

        // Employee X (The one absent and being backed up)
        $employeeX = Employee::factory()->create([
            'user_id' => $owner->id,
            'first_name' => 'Andi',
            'last_name' => 'Pratama',
            'sub_company_id' => null,
            'employment_status' => 'permanent',
            'is_wfa' => true,
        ]);

        // 1. Perform Check In
        $checkInResponse = $this->actingAs($userY)
            ->postJson(route('portal.api.backup-attendance.check-in'), [
                'backup_for_employee_id' => $employeeX->id,
                'check_in_latitude' => -6.200000,
                'check_in_longitude' => 106.816666,
                'notes' => 'Backup shift karena Andi sakit',
            ])
            ->assertStatus(201);

        $this->assertTrue($checkInResponse->json('success'));

        // Assert User Y's attendance record is created as backup
        $this->assertDatabaseHas('employee_attendances', [
            'employee_id' => $employeeY->id,
            'is_backup' => true,
            'backup_for_employee_id' => $employeeX->id,
            'backup_by_employee_id' => $employeeY->id,
        ]);

        // Assert Employee X is marked as absent with backup note
        $this->assertDatabaseHas('employee_attendances', [
            'employee_id' => $employeeX->id,
            'status' => 'absent',
            'backup_by_employee_id' => $employeeY->id,
        ]);

        // 2. Double check-in for the same colleague on the same day should fail
        $this->actingAs($userY)
            ->postJson(route('portal.api.backup-attendance.check-in'), [
                'backup_for_employee_id' => $employeeX->id,
            ])
            ->assertStatus(422);

        // 3. Status endpoint reflects active backup
        $statusResponse = $this->actingAs($userY)
            ->getJson(route('portal.api.backup-attendance.status'))
            ->assertOk();

        $this->assertNotNull($statusResponse->json('data.active_backup'));
        $this->assertEquals($employeeX->id, $statusResponse->json('data.active_backup.backup_for_employee.id'));

        // 4. Perform Check Out
        $checkOutResponse = $this->actingAs($userY)
            ->postJson(route('portal.api.backup-attendance.check-out'), [
                'check_out_latitude' => -6.200000,
                'check_out_longitude' => 106.816666,
            ])
            ->assertOk();

        $this->assertTrue($checkOutResponse->json('success'));

        $this->assertDatabaseHas('employee_attendances', [
            'employee_id' => $employeeY->id,
            'is_backup' => true,
            'backup_for_employee_id' => $employeeX->id,
        ]);

        $backupRecord = EmployeeAttendance::where('employee_id', $employeeY->id)
            ->where('is_backup', true)
            ->first();

        $this->assertNotNull($backupRecord->check_out_at);
    }

    public function test_cannot_backup_colleague_from_different_sub_company(): void
    {
        $owner = User::factory()->create(['role' => 'admin']);
        CompanySetting::updateOrCreate(
            ['user_id' => $owner->id],
            ['backup_attendance_enabled' => true]
        );

        $subCompanyA = SubCompany::create([
            'user_id' => $owner->id,
            'name' => 'Sub Company A',
            'code' => 'SCA',
        ]);
        $subCompanyB = SubCompany::create([
            'user_id' => $owner->id,
            'name' => 'Sub Company B',
            'code' => 'SCB',
        ]);

        $userY = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $owner->id,
            'email_verified_at' => now(),
        ]);
        $employeeY = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => $userY->email,
            'sub_company_id' => $subCompanyA->id,
            'is_wfa' => true,
        ]);
        $userY->update(['employee_id' => $employeeY->id]);

        $employeeB = Employee::factory()->create([
            'user_id' => $owner->id,
            'sub_company_id' => $subCompanyB->id,
            'is_wfa' => true,
        ]);

        $this->actingAs($userY)
            ->postJson(route('portal.api.backup-attendance.check-in'), [
                'backup_for_employee_id' => $employeeB->id,
            ])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_profile_phone_regex_allows_indonesian_formats_and_strips_separators(): void
    {
        $owner = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create([
            'role' => 'user',
            'parent_user_id' => $owner->id,
            'email_verified_at' => now(),
        ]);
        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'email' => $user->email,
            'phone' => '081234567890',
        ]);
        $user->update(['employee_id' => $employee->id]);

        // Test with 628...
        $this->actingAs($user)
            ->putJson(route('portal.api.profile.update'), [
                'phone' => '6281234567890',
                'address' => 'Jl. Sudirman No. 1',
            ])
            ->assertOk()
            ->assertJsonPath('data.phone', '6281234567890');

        // Test with 08... and spaces/hyphens
        $this->actingAs($user)
            ->putJson(route('portal.api.profile.update'), [
                'phone' => '0812-3456-7890',
                'address' => 'Jl. Sudirman No. 2',
            ])
            ->assertOk()
            ->assertJsonPath('data.phone', '081234567890');

        // Test with +62...
        $this->actingAs($user)
            ->putJson(route('portal.api.profile.update'), [
                'phone' => '+62 812 3456 7890',
                'address' => 'Jl. Sudirman No. 3',
            ])
            ->assertOk()
            ->assertJsonPath('data.phone', '+6281234567890');

        // Test invalid phone (letters or too short)
        $this->actingAs($user)
            ->putJson(route('portal.api.profile.update'), [
                'phone' => 'abc123',
                'address' => 'Jl. Sudirman No. 4',
            ])
            ->assertStatus(422);
    }

    public function test_late_duration_formatting_in_attendance_controller(): void
    {
        $reflection = new \ReflectionClass(\App\Http\Controllers\Hris\AttendanceController::class);
        $method = $reflection->getMethod('formatLateDuration');

        $controller = app(\App\Http\Controllers\Hris\AttendanceController::class);

        $this->assertEquals('-', $method->invoke($controller, 0));
        $this->assertEquals('0 jam 45 menit', $method->invoke($controller, 45));
        $this->assertEquals('1 jam 15 menit', $method->invoke($controller, 75));
        $this->assertEquals('2 jam 10 menit', $method->invoke($controller, 130));
    }
}
