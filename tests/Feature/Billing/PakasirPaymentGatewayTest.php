<?php

namespace Tests\Feature\Billing;

use App\Models\Employee;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PakasirPaymentGatewayTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_creation_posts_transaction_to_pakasir(): void
    {
        config()->set('services.pakasir.project', 'depodomain');
        config()->set('services.pakasir.api_key', 'xxx123');

        Http::fake([
            'app.pakasir.com/api/transactioncreate/bni_va' => Http::response([
                'payment' => [
                    'project' => 'depodomain',
                    'order_id' => 'INV-1',
                    'amount' => 99000,
                    'fee' => 1003,
                    'total_payment' => 100003,
                    'payment_method' => 'bni_va',
                    'payment_number' => '88081234567890',
                    'expired_at' => '2025-09-19T01:18:49.678622564Z',
                ],
            ]),
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        Employee::factory()
            ->count(10)
            ->create(['user_id' => $user->id, 'employment_status' => 'active']);

        SubscriptionPlan::query()->create([
            'slug' => 'core',
            'name' => 'Basic',
            'price_per_employee' => 9900,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => [],
            'is_active' => true,
        ]);

        $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), [
                'plan_slug' => 'core',
                'employee_count' => 10,
                'payment_method' => 'bni_va',
            ])
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('success');

        $invoice = SubscriptionInvoice::query()->firstOrFail();

        Http::assertSent(fn ($request): bool => $request->url() === 'https://app.pakasir.com/api/transactioncreate/bni_va'
            && $request['project'] === 'depodomain'
            && $request['order_id'] === $invoice->invoice_number
            && $request['amount'] === 99000
            && $request['api_key'] === 'xxx123');

        $this->assertSame('pakasir', $invoice->payment_gateway);
        $this->assertSame('bni_va', $invoice->payment_method);
        $this->assertSame('88081234567890', $invoice->payment_number);
        $this->assertSame(1003, $invoice->payment_fee);
        $this->assertSame(100003, $invoice->total_payment);
    }

    public function test_pakasir_completed_webhook_marks_invoice_paid_and_activates_subscription(): void
    {
        config()->set('services.pakasir.project', 'depodomain');

        $subscriber = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
        ]);

        $invoice = SubscriptionInvoice::query()->create([
            'user_id' => $subscriber->id,
            'subscription_id' => null,
            'invoice_number' => '240910HDE7C9',
            'amount' => 22000,
            'employee_count' => 8,
            'plan_slug' => 'core',
            'status' => 'pending',
            'payment_gateway' => 'pakasir',
            'payment_method' => 'qris',
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $this
            ->postJson(route('webhooks.pakasir'), [
                'amount' => 22000,
                'order_id' => '240910HDE7C9',
                'project' => 'depodomain',
                'status' => 'completed',
                'payment_method' => 'qris',
                'completed_at' => '2024-09-10T08:07:02.819+07:00',
            ])
            ->assertOk()
            ->assertJson([
                'invoice_status' => 'paid',
            ]);

        $invoice->refresh();

        $this->assertSame('paid', $invoice->status);
        $this->assertNotNull($invoice->subscription_id);
        $this->assertNotNull($invoice->paid_at);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $subscriber->id,
            'plan_slug' => 'core',
            'status' => 'active',
            'employee_count' => 8,
        ]);

        $this->assertDatabaseHas('platform_audit_logs', [
            'target_user_id' => $subscriber->id,
            'target_type' => SubscriptionInvoice::class,
            'target_id' => $invoice->id,
            'action' => 'invoice.pakasir_completed',
        ]);
    }

    public function test_pakasir_webhook_rejects_non_pakasir_invoice(): void
    {
        config()->set('services.pakasir.project', 'depodomain');

        $subscriber = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
        ]);

        SubscriptionInvoice::query()->create([
            'user_id' => $subscriber->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-MANUAL-1',
            'amount' => 22000,
            'employee_count' => 8,
            'plan_slug' => 'core',
            'status' => 'pending',
            'payment_gateway' => null,
            'payment_method' => null,
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $this
            ->postJson(route('webhooks.pakasir'), [
                'amount' => 22000,
                'order_id' => 'INV-MANUAL-1',
                'project' => 'depodomain',
                'status' => 'completed',
                'payment_method' => 'qris',
                'completed_at' => now()->toIso8601String(),
            ])
            ->assertStatus(422)
            ->assertJson([
                'message' => 'Invoice bukan transaksi Pakasir.',
            ]);

        $this->assertDatabaseHas('subscription_invoices', [
            'invoice_number' => 'INV-MANUAL-1',
            'status' => 'pending',
        ]);
    }

    public function test_failed_pakasir_transaction_does_not_leave_pending_invoice(): void
    {
        config()->set('services.pakasir.project', 'depodomain');
        config()->set('services.pakasir.api_key', 'xxx123');

        Http::fake([
            'app.pakasir.com/api/transactioncreate/qris' => Http::response([
                'message' => 'API key tidak valid.',
            ], 401),
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        Employee::factory()
            ->count(10)
            ->create(['user_id' => $user->id, 'employment_status' => 'active']);

        SubscriptionPlan::query()->create([
            'slug' => 'core',
            'name' => 'Basic',
            'price_per_employee' => 2900,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => [],
            'is_active' => true,
        ]);

        $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), [
                'plan_slug' => 'core',
                'employee_count' => 10,
                'payment_method' => 'qris',
            ])
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('error', 'API key tidak valid.');

        $this->assertDatabaseCount('subscription_invoices', 0);
    }

    public function test_existing_pending_pakasir_invoice_is_reused_instead_of_creating_duplicate(): void
    {
        config()->set('services.pakasir.project', 'depodomain');
        config()->set('services.pakasir.api_key', 'xxx123');

        Http::fake([
            'app.pakasir.com/api/transactioncreate/qris' => Http::response([
                'payment' => [
                    'project' => 'depodomain',
                    'order_id' => 'INV-1',
                    'amount' => 29000,
                    'fee' => 1000,
                    'total_payment' => 30000,
                    'payment_method' => 'qris',
                    'payment_number' => 'QRIS-CONTENT',
                    'expired_at' => now()->addDay()->toIso8601String(),
                ],
            ]),
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        Employee::factory()
            ->count(10)
            ->create(['user_id' => $user->id, 'employment_status' => 'active']);

        SubscriptionPlan::query()->create([
            'slug' => 'core',
            'name' => 'Basic',
            'price_per_employee' => 2900,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => [],
            'is_active' => true,
        ]);

        $payload = [
            'plan_slug' => 'core',
            'employee_count' => 10,
            'payment_method' => 'qris',
        ];

        $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), $payload)
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('success');

        $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), $payload)
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('success', 'Invoice pending masih tersedia. Silakan lanjutkan pembayaran.');

        Http::assertSentCount(1);
        $this->assertDatabaseCount('subscription_invoices', 1);
    }

    public function test_pakasir_response_without_payment_number_does_not_leave_pending_invoice(): void
    {
        config()->set('services.pakasir.project', 'depodomain');
        config()->set('services.pakasir.api_key', 'xxx123');

        Http::fake([
            'app.pakasir.com/api/transactioncreate/qris' => Http::response([
                'payment' => [
                    'project' => 'depodomain',
                    'order_id' => 'INV-1',
                    'amount' => 29000,
                    'fee' => 1000,
                    'total_payment' => 30000,
                    'payment_method' => 'qris',
                    'expired_at' => now()->addDay()->toIso8601String(),
                ],
            ]),
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        Employee::factory()
            ->count(10)
            ->create(['user_id' => $user->id, 'employment_status' => 'active']);

        SubscriptionPlan::query()->create([
            'slug' => 'core',
            'name' => 'Basic',
            'price_per_employee' => 2900,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => [],
            'is_active' => true,
        ]);

        $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), [
                'plan_slug' => 'core',
                'employee_count' => 10,
                'payment_method' => 'qris',
            ])
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('error', 'Respons Pakasir tidak menyertakan QRIS/nomor pembayaran.');

        $this->assertDatabaseCount('subscription_invoices', 0);
    }
}
