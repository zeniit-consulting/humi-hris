<?php

namespace Tests\Feature\Hris;

use App\Models\Division;
use App\Models\Employee;
use App\Models\Position;
use App\Models\SubCompany;
use App\Models\SubCompanyAttendanceLocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubCompanyManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_admin_can_manage_sub_company_and_attendance_locations(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->post(route('hris.sub-companies.store'), [
                'code' => 'CLIENT-A',
                'name' => 'PT Client A',
                'contact_person' => 'Budi',
                'contact_phone' => '628123456789',
                'contact_email' => 'budi@example.test',
                'address' => 'Jl. Client A',
                'notes' => 'Managed client',
                'is_active' => true,
            ])
            ->assertRedirect();

        $subCompany = SubCompany::query()->where('code', 'CLIENT-A')->firstOrFail();

        $this
            ->actingAs($user)
            ->post(route('hris.sub-companies.locations.store', $subCompany), [
                'name' => 'Site Utama',
                'address' => 'Jl. Site Utama',
                'latitude' => -6.20001,
                'longitude' => 106.81667,
                'radius_meters' => 150,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('sub_company_attendance_locations', [
            'user_id' => $user->id,
            'sub_company_id' => $subCompany->id,
            'name' => 'Site Utama',
            'radius_meters' => 150,
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('hris.sub-companies.index'));

        $response->assertOk();
        $response->assertSee('PT Client A');
        $response->assertSee('Site Utama');
    }

    public function test_employee_can_be_assigned_to_sub_company(): void
    {
        $user = User::factory()->create();
        $division = Division::factory()->create(['user_id' => $user->id]);
        $position = Position::factory()->create([
            'user_id' => $user->id,
            'division_id' => $division->id,
            'level' => '4',
        ]);
        $subCompany = SubCompany::query()->create([
            'user_id' => $user->id,
            'code' => 'CLIENT-B',
            'name' => 'PT Client B',
            'is_active' => true,
        ]);

        $this
            ->actingAs($user)
            ->post(route('hris.employees.store'), [
                'full_name' => 'Rina Outsource',
                'email' => 'rina@example.test',
                'phone' => '628123456780',
                'hire_date' => now()->toDateString(),
                'employment_status' => 'active',
                'employment_type' => 'contract',
                'pph21_method' => 'gross',
                'pph21_rate' => 0,
                'division_id' => $division->id,
                'sub_company_id' => $subCompany->id,
                'position_id' => $position->id,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('employees', [
            'user_id' => $user->id,
            'first_name' => 'Rina Outsource',
            'sub_company_id' => $subCompany->id,
        ]);
    }

    public function test_sub_company_with_employee_cannot_be_deleted(): void
    {
        $user = User::factory()->create();
        $subCompany = SubCompany::query()->create([
            'user_id' => $user->id,
            'code' => 'CLIENT-C',
            'name' => 'PT Client C',
            'is_active' => true,
        ]);
        Employee::factory()->create([
            'user_id' => $user->id,
            'sub_company_id' => $subCompany->id,
        ]);

        $this
            ->actingAs($user)
            ->delete(route('hris.sub-companies.destroy', $subCompany))
            ->assertRedirect();

        $this->assertDatabaseHas('sub_companies', [
            'id' => $subCompany->id,
        ]);
    }
}
