<?php

namespace Tests\Feature\Admin;

use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriberManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_superadmin_can_view_subscriber_management_page(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'superadmin',
            'parent_user_id' => null,
        ]);

        $subscriber = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
            'company_name' => 'PT Subscriber Test',
        ]);

        Subscription::query()->create([
            'user_id' => $subscriber->id,
            'plan_slug' => 'core',
            'status' => 'active',
            'employee_count' => 12,
            'current_period_start' => now()->toDateString(),
            'current_period_end' => now()->addMonth()->toDateString(),
            'trial_ends_at' => null,
        ]);

        $response = $this
            ->actingAs($superAdmin)
            ->get(route('admin.subscribers.index'));

        $response->assertOk();
        $response->assertSee('PT Subscriber Test');
    }

    public function test_regular_admin_cannot_view_subscriber_management_page(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.subscribers.index'));

        $response->assertForbidden();
    }

    public function test_superadmin_can_update_subscriber_subscription(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'superadmin',
            'parent_user_id' => null,
        ]);

        $subscriber = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
        ]);

        $response = $this
            ->actingAs($superAdmin)
            ->put(route('admin.subscribers.subscription.update', $subscriber), [
                'plan_slug' => 'plus',
                'status' => 'active',
                'employee_count' => 25,
                'current_period_start' => now()->toDateString(),
                'current_period_end' => now()->addMonth()->toDateString(),
                'trial_ends_at' => null,
            ]);

        $response->assertRedirect(route('admin.subscribers.index'));

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $subscriber->id,
            'plan_slug' => 'plus',
            'status' => 'active',
            'employee_count' => 25,
        ]);
    }

    public function test_superadmin_can_approve_pending_invoice(): void
    {
        $superAdmin = User::factory()->create([
            'role' => 'superadmin',
            'parent_user_id' => null,
        ]);

        $subscriber = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
        ]);

        $invoice = SubscriptionInvoice::query()->create([
            'user_id' => $subscriber->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-APPROVE-1',
            'amount' => 72500,
            'employee_count' => 25,
            'plan_slug' => 'plus',
            'status' => 'pending',
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $response = $this
            ->actingAs($superAdmin)
            ->post(route('admin.subscribers.invoices.approve', $invoice));

        $response->assertRedirect(route('admin.subscribers.index'));

        $invoice->refresh();

        $this->assertSame('paid', $invoice->status);
        $this->assertNotNull($invoice->subscription_id);
    }
}
