<?php

namespace Tests\Feature\Billing;

use App\Models\Employee;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SumopodPaymentGatewayTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_creation_posts_transaction_to_sumopod(): void
    {
        config()->set('services.sumopod.api_key', 'test_sumopod_key_123');

        Http::fake([
            '*/api/v1/payments' => Http::response([
                'status' => 'success',
                'data' => [
                    'payment_id' => 'sp-uuid-12345',
                    'order_id' => 'INV-1',
                    'amount' => 50000,
                    'fee' => 750,
                    'qr_string' => '00020101021226670016COM.SUMOPOD.QRIS',
                    'payment_url' => 'https://api-pay.sumopod.com/checkout/sp-uuid-12345',
                    'status' => 'pending',
                    'expires_at' => now()->addHours(24)->toIso8601String(),
                ],
            ]),
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        Employee::factory()
            ->count(5)
            ->create(['user_id' => $user->id, 'employment_status' => 'active']);

        SubscriptionPlan::query()->create([
            'slug' => 'core',
            'name' => 'Basic',
            'price_per_employee' => 10000,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => [],
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), [
                'plan_slug' => 'core',
                'employee_count' => 5,
                'payment_method' => 'qris',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $invoice = SubscriptionInvoice::query()->firstOrFail();

        $response->assertRedirect(route('billing.invoices.payment', $invoice));

        Http::assertSent(function ($request) use ($invoice): bool {
            return str_ends_with($request->url(), '/api/v1/payments')
                && $request->header('X-Api-Key')[0] === 'test_sumopod_key_123'
                && $request['order_id'] === $invoice->invoice_number
                && $request['amount'] === 50000
                && $request['currency'] === 'IDR'
                && $request['expires_in_hours'] === 24
                && $request['payment_method_type_code'] === 'QRIS'
                && filled($request['success_return_url'])
                && filled($request['cancel_return_url']);
        });

        $this->assertSame('sumopod', $invoice->payment_gateway);
        $this->assertSame('qris', $invoice->payment_method);
        $this->assertSame('00020101021226670016COM.SUMOPOD.QRIS', $invoice->payment_number);
        $this->assertSame(750, $invoice->payment_fee);
        $this->assertSame(50750, $invoice->total_payment);
    }

    public function test_sumopod_completed_webhook_marks_invoice_paid_and_activates_subscription(): void
    {
        $subscriber = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
        ]);

        $invoice = SubscriptionInvoice::query()->create([
            'user_id' => $subscriber->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-2026-001',
            'amount' => 50000,
            'employee_count' => 5,
            'plan_slug' => 'core',
            'status' => 'pending',
            'payment_gateway' => 'sumopod',
            'payment_method' => 'qris',
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $payload = [
            'event_type' => 'payment.completed',
            'data' => [
                'payment_id' => 'sp-uuid-99999',
                'order_id' => 'INV-2026-001',
                'amount' => 50000,
                'fee' => 750,
                'net_amount' => 49250,
                'status' => 'completed',
                'payment_method' => 'qris',
                'paid_at' => '2026-06-18T12:00:00Z',
                'settled_at' => '2026-06-20T12:00:00Z',
                'completed_at' => '2026-06-20T12:00:00Z',
            ],
        ];

        $this
            ->postJson(route('webhooks.sumopod'), $payload)
            ->assertOk()
            ->assertJson([
                'invoice_status' => 'paid',
            ]);

        $invoice->refresh();

        $this->assertSame('paid', $invoice->status);
        $this->assertNotNull($invoice->subscription_id);
        $this->assertNotNull($invoice->paid_at);
        $this->assertSame(750, $invoice->payment_fee);
        $this->assertSame(50750, $invoice->total_payment);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $subscriber->id,
            'plan_slug' => 'core',
            'status' => 'active',
            'employee_count' => 5,
        ]);

        $this->assertDatabaseHas('platform_audit_logs', [
            'target_user_id' => $subscriber->id,
            'target_type' => SubscriptionInvoice::class,
            'target_id' => $invoice->id,
            'action' => 'invoice.sumopod_completed',
        ]);
    }

    public function test_sumopod_webhook_rejects_mismatched_amount(): void
    {
        $subscriber = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
        ]);

        $invoice = SubscriptionInvoice::query()->create([
            'user_id' => $subscriber->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-2026-002',
            'amount' => 100000,
            'employee_count' => 10,
            'plan_slug' => 'core',
            'status' => 'pending',
            'payment_gateway' => 'sumopod',
            'payment_method' => 'qris',
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $payload = [
            'event_type' => 'payment.completed',
            'data' => [
                'payment_id' => 'sp-uuid-222',
                'order_id' => 'INV-2026-002',
                'amount' => 50000,
                'fee' => 750,
                'net_amount' => 49250,
                'status' => 'completed',
                'payment_method' => 'qris',
            ],
        ];

        $this
            ->postJson(route('webhooks.sumopod'), $payload)
            ->assertStatus(422)
            ->assertJson([
                'message' => 'Nominal invoice tidak sesuai.',
            ]);

        $invoice->refresh();
        $this->assertSame('pending', $invoice->status);
    }

    public function test_sumopod_webhook_rejects_non_sumopod_invoice(): void
    {
        $subscriber = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
        ]);

        SubscriptionInvoice::query()->create([
            'user_id' => $subscriber->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-PAKASIR-ONLY',
            'amount' => 50000,
            'employee_count' => 5,
            'plan_slug' => 'core',
            'status' => 'pending',
            'payment_gateway' => 'pakasir',
            'payment_method' => 'qris',
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $payload = [
            'event_type' => 'payment.completed',
            'data' => [
                'payment_id' => 'sp-uuid-333',
                'order_id' => 'INV-PAKASIR-ONLY',
                'amount' => 50000,
                'status' => 'completed',
            ],
        ];

        $this
            ->postJson(route('webhooks.sumopod'), $payload)
            ->assertStatus(422)
            ->assertJson([
                'message' => 'Invoice bukan transaksi Sumopod.',
            ]);
    }

    public function test_sumopod_webhook_non_completed_status_keeps_invoice_pending(): void
    {
        $subscriber = User::factory()->create([
            'role' => 'admin',
            'parent_user_id' => null,
        ]);

        $invoice = SubscriptionInvoice::query()->create([
            'user_id' => $subscriber->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-2026-PENDING',
            'amount' => 50000,
            'employee_count' => 5,
            'plan_slug' => 'core',
            'status' => 'pending',
            'payment_gateway' => 'sumopod',
            'payment_method' => 'qris',
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $payload = [
            'event_type' => 'payment.pending',
            'data' => [
                'payment_id' => 'sp-uuid-444',
                'order_id' => 'INV-2026-PENDING',
                'amount' => 50000,
                'status' => 'pending',
            ],
        ];

        $this
            ->postJson(route('webhooks.sumopod'), $payload)
            ->assertOk()
            ->assertJson([
                'message' => 'Webhook diterima, status belum completed.',
                'invoice_status' => 'pending',
            ]);

        $invoice->refresh();
        $this->assertSame('pending', $invoice->status);
    }

    public function test_user_can_open_sumopod_payment_page(): void
    {
        $subscriber = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $invoice = SubscriptionInvoice::query()->create([
            'user_id' => $subscriber->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-SUMOPOD-PAGE',
            'amount' => 50000,
            'employee_count' => 5,
            'plan_slug' => 'core',
            'status' => 'pending',
            'payment_gateway' => 'sumopod',
            'payment_method' => 'qris',
            'payment_number' => '00020101021226670016COM.SUMOPOD.QRIS',
            'payment_payload' => [
                'data' => [
                    'payment_id' => 'sp-uuid-page',
                    'payment_url' => 'https://api-pay.sumopod.com/checkout/sp-uuid-page',
                ],
            ],
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $this
            ->actingAs($subscriber)
            ->get(route('billing.invoices.payment', $invoice))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('billing/payment')
                ->where('invoice.invoice_number', 'INV-SUMOPOD-PAGE')
                ->where('invoice.payment_gateway', 'sumopod')
                ->where('invoice.payment_method', 'qris')
                ->where('payment_url', 'https://api-pay.sumopod.com/checkout/sp-uuid-page')
            );
    }

    public function test_manual_payment_check_marks_completed_sumopod_invoice_paid(): void
    {
        config()->set('services.sumopod.api_key', 'test_sumopod_key_123');

        Http::fake([
            '*/api/v1/payments/sp-uuid-check' => Http::response([
                'status' => 'success',
                'data' => [
                    'payment_id' => 'sp-uuid-check',
                    'order_id' => 'INV-SUMOPOD-MANUAL',
                    'amount' => 50000,
                    'status' => 'completed',
                    'completed_at' => '2026-06-20T12:00:00Z',
                ],
            ]),
        ]);

        $subscriber = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $invoice = SubscriptionInvoice::query()->create([
            'user_id' => $subscriber->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-SUMOPOD-MANUAL',
            'amount' => 50000,
            'employee_count' => 5,
            'plan_slug' => 'core',
            'status' => 'pending',
            'payment_gateway' => 'sumopod',
            'payment_method' => 'qris',
            'payment_number' => '00020101021226670016COM.SUMOPOD.QRIS',
            'payment_payload' => [
                'data' => [
                    'payment_id' => 'sp-uuid-check',
                ],
            ],
            'due_date' => now()->addDays(3)->toDateString(),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $this
            ->actingAs($subscriber)
            ->post(route('billing.invoices.payment.check', $invoice))
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success');

        $invoice->refresh();

        $this->assertSame('paid', $invoice->status);
        $this->assertNotNull($invoice->paid_at);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $subscriber->id,
            'plan_slug' => 'core',
            'status' => 'active',
            'employee_count' => 5,
        ]);
    }

    public function test_existing_pending_sumopod_invoice_is_reused(): void
    {
        config()->set('services.sumopod.api_key', 'test_sumopod_key_123');

        Http::fake([
            '*/api/v1/payments' => Http::response([
                'status' => 'success',
                'data' => [
                    'payment_id' => 'sp-uuid-reuse',
                    'order_id' => 'INV-1',
                    'amount' => 50000,
                    'qr_string' => '00020101021226670016COM.SUMOPOD.QRIS',
                    'status' => 'pending',
                ],
            ]),
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        Employee::factory()
            ->count(5)
            ->create(['user_id' => $user->id, 'employment_status' => 'active']);

        SubscriptionPlan::query()->create([
            'slug' => 'core',
            'name' => 'Basic',
            'price_per_employee' => 10000,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => [],
            'is_active' => true,
        ]);

        $payload = [
            'plan_slug' => 'core',
            'employee_count' => 5,
            'payment_method' => 'qris',
        ];

        $firstResponse = $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), $payload)
            ->assertRedirect()
            ->assertSessionHas('success');

        $invoice = SubscriptionInvoice::query()->firstOrFail();
        $firstResponse->assertRedirect(route('billing.invoices.payment', $invoice));

        $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), $payload)
            ->assertRedirect(route('billing.invoices.payment', $invoice))
            ->assertSessionHas('success', 'Invoice pending masih tersedia. Silakan lanjutkan pembayaran.');

        Http::assertSentCount(1);
        $this->assertDatabaseCount('subscription_invoices', 1);
    }

    public function test_failed_sumopod_transaction_does_not_leave_pending_invoice(): void
    {
        config()->set('services.sumopod.api_key', 'test_sumopod_key_123');

        Http::fake([
            '*/api/v1/payments' => Http::response([
                'message' => 'API Key invalid.',
            ], 401),
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        Employee::factory()
            ->count(5)
            ->create(['user_id' => $user->id, 'employment_status' => 'active']);

        SubscriptionPlan::query()->create([
            'slug' => 'core',
            'name' => 'Basic',
            'price_per_employee' => 10000,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => [],
            'is_active' => true,
        ]);

        $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), [
                'plan_slug' => 'core',
                'employee_count' => 5,
                'payment_method' => 'qris',
            ])
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('error', 'API Key invalid.');

        $this->assertDatabaseCount('subscription_invoices', 0);
    }

    public function test_sumopod_mode_determines_base_url_and_api_key(): void
    {
        $gateway = app(\App\Services\SumopodPaymentGateway::class);

        config()->set('services.sumopod.mode', 'sandbox');
        config()->set('services.sumopod.sandbox_api_key', 'sbx_key_123');
        config()->set('services.sumopod.production_api_key', 'prod_key_456');

        $this->assertTrue($gateway->isSandbox());
        $this->assertFalse($gateway->isProduction());
        $this->assertSame('https://api-pay-sandbox.sumopod.com', $gateway->baseUrl());
        $this->assertSame('sbx_key_123', $gateway->apiKey());

        config()->set('services.sumopod.mode', 'production');

        $this->assertFalse($gateway->isSandbox());
        $this->assertTrue($gateway->isProduction());
        $this->assertSame('https://api-pay.sumopod.com', $gateway->baseUrl());
        $this->assertSame('prod_key_456', $gateway->apiKey());
    }
}
