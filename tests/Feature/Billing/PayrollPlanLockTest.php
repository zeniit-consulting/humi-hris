<?php

namespace Tests\Feature\Billing;

use App\Models\SubscriptionPlan;
use App\Models\User;
use Database\Seeders\SubscriptionPlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PayrollPlanLockTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SubscriptionPlanSeeder::class);
    }

    public function test_basic_plan_has_payroll_locked_in_database_and_billing_props(): void
    {
        $corePlan = SubscriptionPlan::where('slug', 'core')->firstOrFail();
        $this->assertContains('payroll', $corePlan->locked_features);

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $user->subscription()->update([
            'plan_slug' => 'core',
            'status' => 'active',
            'employee_count' => 5,
            'current_period_start' => Carbon::today()->toDateString(),
            'current_period_end' => Carbon::today()->addMonth()->toDateString(),
            'trial_ends_at' => null,
        ]);

        $this->actingAs($user)
            ->get(route('billing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('billing/index')
                ->where('subscription.plan_slug', 'core')
                ->where('subscription.locked_features', fn ($features) => collect($features)->contains('payroll'))
            );
    }

    public function test_basic_plan_cannot_access_payroll_page_and_is_redirected_to_billing_with_upgrade_to_plus_message(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $user->subscription()->update([
            'plan_slug' => 'core',
            'status' => 'active',
            'employee_count' => 5,
            'current_period_start' => Carbon::today()->toDateString(),
            'current_period_end' => Carbon::today()->addMonth()->toDateString(),
            'trial_ends_at' => null,
        ]);

        $response = $this->actingAs($user)->get(route('hris.payrolls.index'));

        $response->assertRedirect(route('billing.index'));
        $response->assertSessionHas('error', 'Fitur Penggajian (Payroll) tidak tersedia pada paket Basic Anda. Upgrade ke paket Plus untuk mengakses fitur ini.');
    }

    public function test_plus_plan_can_access_payroll_page(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $user->subscription()->update([
            'plan_slug' => 'plus',
            'status' => 'active',
            'employee_count' => 5,
            'current_period_start' => Carbon::today()->toDateString(),
            'current_period_end' => Carbon::today()->addMonth()->toDateString(),
            'trial_ends_at' => null,
        ]);

        $response = $this->actingAs($user)->get(route('hris.payrolls.index'));

        $response->assertOk();
    }
}
