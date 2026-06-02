<?php

namespace Tests\Feature\Billing;

use App\Models\Employee;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BillingInvoiceCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_basic_invoice_with_post_request(): void
    {
        config()->set('services.pakasir.project', 'depodomain');
        config()->set('services.pakasir.api_key', 'xxx123');

        Http::fake([
            'app.pakasir.com/api/transactioncreate/qris' => Http::response([
                'payment' => [
                    'project' => 'depodomain',
                    'order_id' => 'INV-TEST',
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

        Employee::factory()
            ->count(3)
            ->create(['user_id' => $user->id, 'employment_status' => 'inactive']);

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
                'employee_count' => 99,
            ])
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('success');

        $invoice = SubscriptionInvoice::query()->firstOrFail();

        $this->assertSame($user->id, $invoice->user_id);
        $this->assertSame('core', $invoice->plan_slug);
        $this->assertSame(10, $invoice->employee_count);
        $this->assertSame(29000, $invoice->amount);
        $this->assertSame('pending', $invoice->status);
        $this->assertSame('pakasir', $invoice->payment_gateway);
        $this->assertSame('qris', $invoice->payment_method);
        $this->assertSame('QRIS-CONTENT', $invoice->payment_number);
    }

    public function test_get_billing_invoices_without_query_creates_basic_invoice_for_legacy_form(): void
    {
        config()->set('services.pakasir.project', 'depodomain');
        config()->set('services.pakasir.api_key', 'xxx123');

        Http::fake([
            'app.pakasir.com/api/transactioncreate/qris' => Http::response([
                'payment' => [
                    'project' => 'depodomain',
                    'order_id' => 'INV-TEST',
                    'amount' => 5800,
                    'fee' => 1000,
                    'total_payment' => 6800,
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
            ->count(2)
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
            ->get(route('billing.invoices.index'))
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('success');

        $invoice = SubscriptionInvoice::query()->firstOrFail();

        $this->assertSame('core', $invoice->plan_slug);
        $this->assertSame(2, $invoice->employee_count);
        $this->assertSame(5800, $invoice->amount);
    }

    public function test_get_billing_invoices_with_plan_query_still_creates_invoice_for_legacy_form(): void
    {
        config()->set('services.pakasir.project', 'depodomain');
        config()->set('services.pakasir.api_key', 'xxx123');

        Http::fake([
            'app.pakasir.com/api/transactioncreate/qris' => Http::response([
                'payment' => [
                    'project' => 'depodomain',
                    'order_id' => 'INV-TEST',
                    'amount' => 5800,
                    'fee' => 1000,
                    'total_payment' => 6800,
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
            ->count(2)
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
            ->get(route('billing.invoices.index', [
                'plan_slug' => 'core',
                'employee_count' => 2,
                'payment_method' => 'qris',
            ]))
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('success');

        $invoice = SubscriptionInvoice::query()->firstOrFail();

        $this->assertSame(2, $invoice->employee_count);
        $this->assertSame(5800, $invoice->amount);
        $this->assertSame('qris', $invoice->payment_method);
    }
}
