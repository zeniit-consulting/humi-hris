<?php

namespace Tests\Feature\Hris;

use App\Models\Employee;
use App\Models\Position;
use App\Models\SubCompany;
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

    public function test_organization_chart_excludes_employees_from_inactive_sub_companies(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $activeSubCompany = SubCompany::create([
            'user_id' => $user->id,
            'code' => 'SUB-ACT',
            'name' => 'Active Sub Company',
            'is_active' => true,
        ]);

        $inactiveSubCompany = SubCompany::create([
            'user_id' => $user->id,
            'code' => 'SUB-INACT',
            'name' => 'Inactive Sub Company',
            'is_active' => false,
        ]);

        $pos1 = Position::factory()->create([
            'user_id' => $user->id,
            'name' => 'Field Operator',
            'code' => 'OPR',
        ]);

        $pos2 = Position::factory()->create([
            'user_id' => $user->id,
            'name' => 'Site Coordinator',
            'code' => 'CRD',
        ]);

        // Employee under active sub-company -> should be included
        $activeSubEmployee = Employee::factory()->create([
            'user_id' => $user->id,
            'position_id' => $pos1->id,
            'sub_company_id' => $activeSubCompany->id,
            'employee_code' => 'EMP-SUB-ACTIVE',
            'employment_status' => 'active',
            'is_active' => true,
        ]);

        // Employee under inactive sub-company -> MUST BE EXCLUDED!
        Employee::factory()->create([
            'user_id' => $user->id,
            'position_id' => $pos1->id,
            'sub_company_id' => $inactiveSubCompany->id,
            'employee_code' => 'EMP-SUB-INACTIVE',
            'employment_status' => 'active',
            'is_active' => true,
        ]);

        // Employee in pos2 only belongs to inactive sub-company -> pos2 must become VACANT!
        Employee::factory()->create([
            'user_id' => $user->id,
            'position_id' => $pos2->id,
            'sub_company_id' => $inactiveSubCompany->id,
            'employee_code' => 'EMP-ONLY-INACTIVE',
            'employment_status' => 'active',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->get(route('hris.organization-chart.index'))
            ->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('hris/organization-chart/index')
            ->has('sub_companies', 1)
            ->where('sub_companies.0.id', $activeSubCompany->id)
            ->where('stats.total_employees', 1)
            ->where('stats.filled_positions', 1)
            ->where('stats.vacant_positions', 1)
            ->where('chart', function ($nodes) use ($pos1, $pos2, $activeSubEmployee) {
                $collection = collect($nodes);
                $node1 = $collection->firstWhere('id', $pos1->id);
                $node2 = $collection->firstWhere('id', $pos2->id);

                $this->assertNotNull($node1);
                $this->assertEquals(1, $node1['employees_count']);
                $this->assertEquals([$activeSubEmployee->id], collect($node1['employees'])->pluck('id')->all());
                $this->assertFalse($node1['is_vacant']);

                $this->assertNotNull($node2);
                $this->assertEquals(0, $node2['employees_count']);
                $this->assertTrue($node2['is_vacant']);
                $this->assertEquals([], $node2['employees']);

                return true;
            })
        );
    }
}
