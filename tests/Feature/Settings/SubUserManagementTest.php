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
}
