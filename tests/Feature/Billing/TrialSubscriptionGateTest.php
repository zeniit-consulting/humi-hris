<?php

namespace Tests\Feature\Billing;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TrialSubscriptionGateTest extends TestCase
{
    use RefreshDatabase;

    public function test_expired_trial_redirects_admin_to_billing(): void
    {
        Carbon::setTestNow('2026-05-28 09:00:00');

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $user->subscription()->update([
            'plan_slug' => 'free',
            'status' => 'trial',
            'current_period_start' => Carbon::today()->subDays(31)->toDateString(),
            'current_period_end' => Carbon::today()->subDay()->toDateString(),
            'trial_ends_at' => Carbon::today()->subDay()->toDateString(),
        ]);

        $this
            ->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan_slug' => 'free',
            'status' => 'expired',
        ]);

        Carbon::setTestNow();
    }

    public function test_expired_trial_can_still_open_billing_page(): void
    {
        Carbon::setTestNow('2026-05-28 09:00:00');

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $user->subscription()->update([
            'plan_slug' => 'free',
            'status' => 'expired',
            'current_period_start' => Carbon::today()->subDays(31)->toDateString(),
            'current_period_end' => Carbon::today()->subDay()->toDateString(),
            'trial_ends_at' => Carbon::today()->subDay()->toDateString(),
        ]);

        $this
            ->actingAs($user)
            ->get(route('billing.index'))
            ->assertOk();

        Carbon::setTestNow();
    }

    public function test_billing_page_uses_relative_invoice_actions_even_when_app_url_is_production(): void
    {
        config()->set('app.url', 'https://backoffice.zeniconsulting.com/api');

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $this
            ->actingAs($user)
            ->get('/billing')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('billing/index')
                ->where('billing_urls.index', '/billing')
                ->where('billing_urls.invoice_store', '/billing/invoices')
                ->where('billing_urls.invoice_payment_template', '/billing/invoices/__INVOICE_ID__/payment')
                ->where('billing_urls.invoice_payment_check_template', '/billing/invoices/__INVOICE_ID__/payment/check')
                ->where('billing_urls.invoice_proof_template', '/billing/invoices/__INVOICE_ID__/proof')
                ->where('billing_urls.invoice_cancel_template', '/billing/invoices/__INVOICE_ID__')
            );
    }
}
