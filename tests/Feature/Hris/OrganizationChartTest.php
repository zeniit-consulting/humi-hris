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
}
