<?php

namespace Tests\Feature\Api;

use App\Models\Division;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ThirdPartyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_admin_can_issue_third_party_token(): void
    {
        $user = User::factory()->create([
            'email' => 'owner@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/third-party/v1/auth/token', [
            'email' => 'owner@example.com',
            'password' => 'password',
            'token_name' => 'partner-system',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonPath('data.abilities.0', 'third-party')
            ->assertJsonStructure([
                'data' => ['access_token', 'user' => ['id', 'email', 'account_owner_id']],
            ]);
    }

    public function test_non_owner_admin_cannot_issue_third_party_token(): void
    {
        $owner = User::factory()->create();
        $staff = User::factory()->create([
            'parent_user_id' => $owner->id,
            'role' => 'staff',
            'email' => 'staff@example.com',
            'password' => 'password',
        ]);

        $this->postJson('/api/third-party/v1/auth/token', [
            'email' => $staff->email,
            'password' => 'password',
        ])->assertForbidden();
    }

    public function test_third_party_employee_endpoint_requires_third_party_ability(): void
    {
        $user = User::factory()->create();

        $this->getJson('/api/third-party/v1/employees')->assertUnauthorized();

        Sanctum::actingAs($user, ['mobile']);

        $this->getJson('/api/third-party/v1/employees')->assertForbidden();
    }

    public function test_third_party_employee_endpoint_is_scoped_to_account_owner(): void
    {
        $owner = User::factory()->create();
        $otherOwner = User::factory()->create();

        $division = Division::factory()->create(['user_id' => $owner->id]);
        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
        ]);

        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'employee_code' => 'EMP-API-001',
            'first_name' => 'Api',
            'last_name' => 'Partner',
        ]);

        Employee::factory()->create([
            'user_id' => $otherOwner->id,
            'employee_code' => 'EMP-OTHER-001',
        ]);

        Sanctum::actingAs($owner, ['third-party']);

        $this->getJson('/api/third-party/v1/employees')
            ->assertOk()
            ->assertJsonPath('data.items.0.id', $employee->id)
            ->assertJsonPath('data.items.0.employee_code', 'EMP-API-001')
            ->assertJsonCount(1, 'data.items');
    }

    public function test_third_party_attendance_endpoint_supports_date_filter(): void
    {
        $owner = User::factory()->create();
        $employee = Employee::factory()->create([
            'user_id' => $owner->id,
            'employee_code' => 'EMP-API-002',
        ]);

        EmployeeAttendance::factory()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-06-01',
            'status' => 'present',
        ]);

        EmployeeAttendance::factory()->create([
            'user_id' => $owner->id,
            'employee_id' => $employee->id,
            'attendance_date' => '2026-06-08',
            'status' => 'late',
        ]);

        Sanctum::actingAs($owner, ['third-party']);

        $this->getJson('/api/third-party/v1/attendances?date_from=2026-06-05&date_to=2026-06-09')
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.status', 'late')
            ->assertJsonPath('data.items.0.employee.employee_code', 'EMP-API-002');
    }
}
