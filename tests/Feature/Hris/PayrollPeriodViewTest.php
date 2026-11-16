<?php

namespace Tests\Feature\Hris;

use App\Models\PayrollRun;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PayrollPeriodViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_payroll_index_returns_empty_existing_periods_when_no_runs_exist(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $response = $this->actingAs($user)->get(route('hris.payrolls.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('hris/payrolls/index')
            ->has('existingPeriods', 0)
        );
    }

    public function test_payroll_index_returns_existing_periods_sorted_descending_with_correct_metadata(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        // Create runs in 2026-09, 2026-10 (2 batches), 2026-11
        PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-09',
            'type' => 'regular',
            'batch_purpose' => 'regular',
            'status' => 'released',
            'is_saved' => true,
            'employees_count' => 5,
            'total_net_salary' => 25000000,
        ]);

        PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-10',
            'type' => 'regular',
            'batch_purpose' => 'regular',
            'status' => 'draft',
            'is_saved' => false,
            'employees_count' => 5,
            'total_net_salary' => 25000000,
        ]);

        PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-10',
            'type' => 'regular',
            'batch_purpose' => 'additional',
            'status' => 'draft',
            'is_saved' => false,
            'employees_count' => 2,
            'total_net_salary' => 6000000,
        ]);

        PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-11',
            'type' => 'regular',
            'batch_purpose' => 'regular',
            'status' => 'draft',
            'is_saved' => false,
            'employees_count' => 7,
            'total_net_salary' => 35000000,
        ]);

        $response = $this->actingAs($user)->get(route('hris.payrolls.index', ['period' => '2026-11']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('hris/payrolls/index')
            ->has('existingPeriods', 3)
            ->where('existingPeriods.0.period', '2026-11')
            ->where('existingPeriods.0.batches_count', 1)
            ->where('existingPeriods.0.total_employees', 7)
            ->where('existingPeriods.0.has_released', false)
            ->where('existingPeriods.1.period', '2026-10')
            ->where('existingPeriods.1.batches_count', 2)
            ->where('existingPeriods.1.total_employees', 7)
            ->where('existingPeriods.1.has_released', false)
            ->where('existingPeriods.2.period', '2026-09')
            ->where('existingPeriods.2.batches_count', 1)
            ->where('existingPeriods.2.total_employees', 5)
            ->where('existingPeriods.2.has_released', true)
        );
    }

    public function test_payroll_index_separates_regular_and_thr_existing_periods(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-03',
            'type' => 'thr',
            'status' => 'released',
            'is_saved' => true,
            'employees_count' => 10,
            'total_net_salary' => 50000000,
        ]);

        PayrollRun::factory()->create([
            'user_id' => $user->id,
            'period' => '2026-11',
            'type' => 'regular',
            'status' => 'draft',
            'is_saved' => false,
            'employees_count' => 10,
            'total_net_salary' => 50000000,
        ]);

        // Regular request should only see regular periods
        $responseRegular = $this->actingAs($user)->get(route('hris.payrolls.index', ['type' => 'regular']));
        $responseRegular->assertOk();
        $responseRegular->assertInertia(fn (Assert $page) => $page
            ->has('existingPeriods', 1)
            ->where('existingPeriods.0.period', '2026-11')
        );

        // THR request should only see THR periods
        $responseThr = $this->actingAs($user)->get(route('hris.payrolls.index', ['type' => 'thr']));
        $responseThr->assertOk();
        $responseThr->assertInertia(fn (Assert $page) => $page
            ->has('existingPeriods', 1)
            ->where('existingPeriods.0.period', '2026-03')
        );
    }
}
