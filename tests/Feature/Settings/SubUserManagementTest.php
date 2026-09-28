<?php

namespace Tests\Feature\Settings;

use App\Models\SubCompany;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_link_multiple_sub_companies_to_sub_user(): void
    {
        $admin = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $firstCompany = SubCompany::query()->create([
            'user_id' => $admin->id,
            'code' => 'SUB-A',
            'name' => 'Sub A',
        ]);

        $secondCompany = SubCompany::query()->create([
            'user_id' => $admin->id,
            'code' => 'SUB-B',
            'name' => 'Sub B',
        ]);

        $this->actingAs($admin)->post(route('settings.users.store'), [
            'name' => 'Supervisor Area',
            'email' => 'supervisor@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'client_supervisor',
            'client_sub_company_ids' => [$firstCompany->id, $secondCompany->id],
        ])->assertRedirect();

        $subUser = User::query()
            ->where('parent_user_id', $admin->id)
            ->where('email', 'supervisor@example.com')
            ->firstOrFail();

        $this->assertSame($firstCompany->id, (int) $subUser->client_sub_company_id);
        $this->assertDatabaseHas('sub_company_user', [
            'user_id' => $subUser->id,
            'sub_company_id' => $firstCompany->id,
        ]);
        $this->assertDatabaseHas('sub_company_user', [
            'user_id' => $subUser->id,
            'sub_company_id' => $secondCompany->id,
        ]);
    }

    public function test_sub_user_update_syncs_linked_sub_companies(): void
    {
        $admin = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $firstCompany = SubCompany::query()->create([
            'user_id' => $admin->id,
            'code' => 'SUB-A',
            'name' => 'Sub A',
        ]);

        $secondCompany = SubCompany::query()->create([
            'user_id' => $admin->id,
            'code' => 'SUB-B',
            'name' => 'Sub B',
        ]);

        $subUser = User::factory()->create([
            'parent_user_id' => $admin->id,
            'role' => 'admin_staff',
            'client_sub_company_id' => $firstCompany->id,
            'email_verified_at' => now(),
        ]);
        $subUser->clientSubCompanies()->attach($firstCompany->id);

        $this->actingAs($admin)->put(route('settings.users.update', $subUser), [
            'name' => $subUser->name,
            'email' => $subUser->email,
            'password' => '',
            'password_confirmation' => '',
            'role' => 'admin_staff',
            'client_sub_company_ids' => [$secondCompany->id],
        ])->assertRedirect();

        $subUser->refresh();

        $this->assertSame($secondCompany->id, (int) $subUser->client_sub_company_id);
        $this->assertDatabaseMissing('sub_company_user', [
            'user_id' => $subUser->id,
            'sub_company_id' => $firstCompany->id,
        ]);
        $this->assertDatabaseHas('sub_company_user', [
            'user_id' => $subUser->id,
            'sub_company_id' => $secondCompany->id,
        ]);
    }

    public function test_admin_can_assign_employee_as_sub_admin_with_scoped_permissions(): void
    {
        $admin = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $employee = \App\Models\Employee::factory()->create([
            'user_id' => $admin->id,
            'first_name' => 'Sarah',
            'last_name' => 'HR',
            'email' => 'sarah@example.com',
        ]);

        $this->actingAs($admin)->post(route('settings.users.store'), [
            'employee_id' => $employee->id,
            'name' => 'Sarah HR',
            'email' => 'sarah@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin_staff',
            'permissions' => ['attendances', 'schedules'],
            'client_sub_company_ids' => [],
        ])->assertRedirect();

        $subAdmin = User::query()
            ->where('parent_user_id', $admin->id)
            ->where('employee_id', $employee->id)
            ->firstOrFail();

        $this->assertSame('admin_staff', $subAdmin->role);
        $this->assertSame(['attendances', 'schedules'], $subAdmin->permissions);
        $this->assertTrue($subAdmin->isSubAdmin());
        $this->assertTrue($subAdmin->hasModulePermission('attendances'));
        $this->assertTrue($subAdmin->hasModulePermission('schedules'));
        $this->assertFalse($subAdmin->hasModulePermission('payrolls'));
    }

    public function test_sub_admin_is_restricted_by_module_permissions(): void
    {
        $this->withoutVite();

        $admin = User::factory()->create(['email_verified_at' => now()]);

        $employee = \App\Models\Employee::factory()->create([
            'user_id' => $admin->id,
            'email' => 'staff@example.com',
        ]);

        $subAdmin = User::factory()->create([
            'parent_user_id' => $admin->id,
            'employee_id' => $employee->id,
            'role' => 'admin_staff',
            'permissions' => ['attendances'],
            'email_verified_at' => now(),
        ]);

        // Can access permitted module (attendances)
        $this->actingAs($subAdmin)
            ->get(route('hris.attendances.index'))
            ->assertOk();

        // Forbidden from accessing unpermitted module (payrolls)
        $this->actingAs($subAdmin)
            ->get(route('hris.payrolls.index'))
            ->assertForbidden();
    }

    public function test_sub_admin_accessing_admin_on_mobile_is_redirected_to_portal(): void
    {
        $this->withoutVite();

        $admin = User::factory()->create(['email_verified_at' => now()]);

        $employee = \App\Models\Employee::factory()->create([
            'user_id' => $admin->id,
            'email' => 'staff.mobile@example.com',
        ]);

        $subAdmin = User::factory()->create([
            'parent_user_id' => $admin->id,
            'employee_id' => $employee->id,
            'role' => 'admin_staff',
            'permissions' => ['attendances', 'schedules'],
            'email_verified_at' => now(),
        ]);

        $mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

        // Accessing dashboard on mobile redirects to portal
        $this->actingAs($subAdmin)
            ->withHeader('User-Agent', $mobileUserAgent)
            ->get(route('dashboard'))
            ->assertRedirect(route('portal.index'));

        // Accessing HRIS admin page on mobile redirects to portal
        $this->actingAs($subAdmin)
            ->withHeader('User-Agent', $mobileUserAgent)
            ->get(route('hris.attendances.index'))
            ->assertRedirect(route('portal.index'));

        // Can access portal page on mobile
        $this->actingAs($subAdmin)
            ->withHeader('User-Agent', $mobileUserAgent)
            ->get(route('portal.index'))
            ->assertOk();

        // Desktop access to dashboard works without redirection to portal
        $desktopUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        $this->actingAs($subAdmin)
            ->withHeader('User-Agent', $desktopUserAgent)
            ->get(route('dashboard'))
            ->assertOk();
    }
}
