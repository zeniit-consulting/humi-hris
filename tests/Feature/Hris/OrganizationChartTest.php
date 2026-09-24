<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrganizationChartTest extends TestCase
{
    use RefreshDatabase;

    public function test_organization_chart_excludes_resigned_employees(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $position = Position::factory()->create([
            'user_id' => $user->id,
        ]);

        $activeEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'position_id' => $position->id,
            'employee_code' => 'EMP-ACTIVE',
            'employment_status' => 'active',
            'is_active' => true,
        ]);

        Employee::factory()->create([
            'user_id' => $user->id,
            'position_id' => $position->id,
            'employee_code' => 'EMP-RESIGNED',
            'employment_status' => 'resigned',
            'is_active' => false,
        ]);

        $this->actingAs($user)
            ->get(route('hris.organization-chart.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/organization-chart/index')
                ->has('chart', 1)
                ->where('chart.0.employees', fn ($employees) => collect($employees)->pluck('id')->all() === [$activeEmployee->id])
                ->where('chart.0.employee_code', 'EMP-ACTIVE')
                ->where('chart.0.is_vacant', false));
    }

    public function test_organization_chart_marks_position_vacant_when_only_offboarded_employee_assigned(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $position = Position::factory()->create([
            'user_id' => $user->id,
            'name' => 'Finance Lead',
        ]);

        Employee::factory()->create([
            'user_id' => $user->id,
            'position_id' => $position->id,
            'employee_code' => 'EMP-OFFBOARDED',
            'employment_status' => 'resigned',
            'offboarded_at' => '2026-05-01',
            'is_active' => false,
        ]);

        $this->actingAs($user)
            ->get(route('hris.organization-chart.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/organization-chart/index')
                ->has('chart', 1)
                ->where('chart.0.employees', [])
                ->where('chart.0.employee_code', 'VACANT')
                ->where('chart.0.full_name', 'Vacant')
                ->where('chart.0.is_vacant', true));
    }

    public function test_organization_chart_excludes_positions_and_reparents_descendants(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        // Level 0: CEO
        $ceo = Position::factory()->create([
            'user_id' => $user->id,
            'name' => 'Chief Executive Officer',
            'code' => 'CEO',
            'level' => '0',
            'parent_position_id' => null,
            'exclude_from_org_chart' => false,
        ]);

        // Level 1: Director (Excluded!)
        $director = Position::factory()->create([
            'user_id' => $user->id,
            'name' => 'Director of Ops',
            'code' => 'DIR',
            'level' => '1',
            'parent_position_id' => $ceo->id,
            'exclude_from_org_chart' => true,
        ]);

        // Level 2: Manager (child of Director)
        $manager = Position::factory()->create([
            'user_id' => $user->id,
            'name' => 'Operations Manager',
            'code' => 'MGR',
            'level' => '2',
            'parent_position_id' => $director->id,
            'exclude_from_org_chart' => false,
        ]);

        $this->actingAs($user)
            ->get(route('hris.organization-chart.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('hris/organization-chart/index')
                ->has('chart', 1) // Only CEO at root
                ->where('chart.0.id', $ceo->id)
                ->has('chart.0.children', 1)
                ->where('chart.0.children.0.id', $manager->id) // Manager is directly under CEO!
                ->where('stats.excluded_positions', 1)
                ->where('stats.total_nodes', 2));
    }

    public function test_can_update_organization_chart_exclusions(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $pos1 = Position::factory()->create([
            'user_id' => $user->id,
            'exclude_from_org_chart' => false,
        ]);

        $pos2 = Position::factory()->create([
            'user_id' => $user->id,
            'exclude_from_org_chart' => false,
        ]);

        // Bulk update
        $response = $this->actingAs($user)
            ->post(route('hris.organization-chart.exclusions.update'), [
                'excluded_position_ids' => [$pos1->id],
            ]);

        $response->assertRedirect();
        $this->assertTrue($pos1->fresh()->exclude_from_org_chart);
        $this->assertFalse($pos2->fresh()->exclude_from_org_chart);

        // Single position toggle
        $this->actingAs($user)
            ->post(route('hris.organization-chart.exclusions.update'), [
                'position_id' => $pos2->id,
                'exclude' => true,
            ])
            ->assertRedirect();

        $this->assertTrue($pos2->fresh()->exclude_from_org_chart);
    }
}
