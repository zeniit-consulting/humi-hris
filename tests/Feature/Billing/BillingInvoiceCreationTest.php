<?php

namespace Tests\Feature\Billing;

use App\Models\Employee;
use App\Models\Subscription;
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

        $response = $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), [
                'plan_slug' => 'core',
                'employee_count' => 99,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $invoice = SubscriptionInvoice::query()->firstOrFail();
        $response->assertRedirect(route('billing.invoices.payment', $invoice));

        $this->assertSame($user->id, $invoice->user_id);
        $this->assertSame('core', $invoice->plan_slug);
        $this->assertSame(10, $invoice->employee_count);
        $this->assertSame(29000, $invoice->amount);
        $this->assertSame('pending', $invoice->status);
        $this->assertSame('pakasir', $invoice->payment_gateway);
        $this->assertSame('qris', $invoice->payment_method);
        $this->assertSame('QRIS-CONTENT', $invoice->payment_number);
    }

    public function test_admin_staff_cannot_create_billing_invoice_for_owner_account(): void
    {
        config()->set('services.pakasir.project', 'depodomain');
        config()->set('services.pakasir.api_key', 'xxx123');

        Http::fake();

        $owner = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $staff = User::factory()->create([
            'role' => 'admin_staff',
            'parent_user_id' => $owner->id,
            'phone_verified_at' => now(),
        ]);

        Employee::factory()
            ->count(10)
            ->create(['user_id' => $owner->id, 'employment_status' => 'active']);

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
            ->actingAs($staff)
            ->post(route('billing.invoices.store'), [
                'plan_slug' => 'core',
                'payment_method' => 'qris',
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('subscription_invoices', 0);
        Http::assertNothingSent();
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

        $response = $this
            ->actingAs($user)
            ->get(route('billing.invoices.index'))
            ->assertRedirect()
            ->assertSessionHas('success');

        $invoice = SubscriptionInvoice::query()->firstOrFail();
        $response->assertRedirect(route('billing.invoices.payment', $invoice));

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

        $response = $this
            ->actingAs($user)
            ->get(route('billing.invoices.index', [
                'plan_slug' => 'core',
                'employee_count' => 2,
                'payment_method' => 'qris',
            ]))
            ->assertRedirect()
            ->assertSessionHas('success');

        $invoice = SubscriptionInvoice::query()->firstOrFail();
        $response->assertRedirect(route('billing.invoices.payment', $invoice));

        $this->assertSame(2, $invoice->employee_count);
        $this->assertSame(5800, $invoice->amount);
        $this->assertSame('qris', $invoice->payment_method);
    }

    public function test_active_plus_subscription_can_downgrade_to_basic_without_invoice(): void
    {
        config()->set('services.pakasir.project', null);
        config()->set('services.pakasir.api_key', null);

        Http::fake();

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        Employee::factory()
            ->count(3)
            ->create(['user_id' => $user->id, 'employment_status' => 'active']);

        SubscriptionPlan::query()->create([
            'slug' => 'core',
            'name' => 'Basic',
            'price_per_employee' => 2900,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => ['performance'],
            'is_active' => true,
        ]);

        SubscriptionPlan::query()->create([
            'slug' => 'plus',
            'name' => 'Plus',
            'price_per_employee' => 7500,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => [],
            'is_active' => true,
        ]);

        Subscription::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'plan_slug' => 'plus',
                'status' => 'active',
                'employee_count' => 3,
                'current_period_start' => now()->toDateString(),
                'current_period_end' => now()->addMonth()->toDateString(),
                'trial_ends_at' => null,
            ],
        );

        SubscriptionInvoice::query()->create([
            'user_id' => $user->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-PENDING-PLUS',
            'amount' => 22500,
            'employee_count' => 3,
            'plan_slug' => 'plus',
            'status' => 'pending',
            'payment_gateway' => 'pakasir',
            'payment_method' => 'qris',
            'payment_number' => 'QRIS-OLD',
            'due_date' => now()->addDays(3)->toDateString(),
        ]);

        $this
            ->actingAs($user)
            ->post(route('billing.invoices.store'), [
                'plan_slug' => 'core',
                'payment_method' => 'qris',
            ])
            ->assertRedirect(route('billing.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan_slug' => 'core',
            'status' => 'active',
            'employee_count' => 3,
        ]);
        $this->assertDatabaseHas('subscription_invoices', [
            'invoice_number' => 'INV-PENDING-PLUS',
            'status' => 'cancelled',
        ]);
        $this->assertSame(1, SubscriptionInvoice::query()->count());
        Http::assertNothingSent();
    }

    public function test_proforma_invoices_are_automatically_generated_for_h_minus_7_expiring_subscriptions(): void
    {
        config()->set('services.pakasir.project', 'depodomain');
        config()->set('services.pakasir.api_key', 'xxx123');

        Http::fake([
            'app.pakasir.com/api/transactioncreate/qris' => Http::response([
                'payment' => [
                    'project' => 'depodomain',
                    'order_id' => 'INV-AUTO',
                    'amount' => 14500,
                    'fee' => 500,
                    'total_payment' => 15000,
                    'payment_method' => 'qris',
                    'payment_number' => '00020101021226540014ID.LINKAJA.WWW011893600911002237089402081022370851440014ID.CO.QRIS.WWW0215ID10200210000020303UMI5204581253033605405150005802ID5913DEPO DOMAIN6007JAKARTA61051234062070703A016304C14D',
                    'expired_at' => now()->addDay()->toIso8601String(),
                ],
            ]),
        ]);

        SubscriptionPlan::query()->create([
            'slug' => 'core',
            'name' => 'Basic',
            'price_per_employee' => 2900,
            'max_employees' => null,
            'max_months' => null,
            'locked_features' => [],
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
            'company_name' => 'PT Maju Bersama',
        ]);

        Employee::factory()
            ->count(5)
            ->create(['user_id' => $user->id, 'employment_status' => 'active']);

        // Subscription expiring exactly in 7 days (H-7)
        $expiringDate = now()->addDays(7)->toDateString();
        Subscription::query()->create([
            'user_id' => $user->id,
            'plan_slug' => 'core',
            'status' => 'active',
            'employee_count' => 5,
            'current_period_start' => now()->subMonth()->addDays(7)->toDateString(),
            'current_period_end' => $expiringDate,
            'trial_ends_at' => null,
        ]);

        $this->artisan('subscription:notify-renewal-reminder --days=7')
            ->assertSuccessful();

        $this->assertDatabaseHas('subscription_invoices', [
            'user_id' => $user->id,
            'plan_slug' => 'core',
            'employee_count' => 5,
            'amount' => 14500, // 5 * 2900
            'status' => 'pending',
            'payment_gateway' => 'pakasir',
            'payment_method' => 'qris',
        ]);

        $invoice = SubscriptionInvoice::query()->where('user_id', $user->id)->firstOrFail();
        $this->assertEquals($expiringDate, $invoice->due_date?->toDateString());
        $this->assertNotNull($invoice->payment_number);
        $this->assertEquals('00020101021226540014ID.LINKAJA.WWW011893600911002237089402081022370851440014ID.CO.QRIS.WWW0215ID10200210000020303UMI5204581253033605405150005802ID5913DEPO DOMAIN6007JAKARTA61051234062070703A016304C14D', $invoice->payment_number);
    }

    public function test_user_can_download_invoice_pdf(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
            'company_name' => 'PT Sumber Rezeki',
        ]);

        $invoice = SubscriptionInvoice::query()->create([
            'user_id' => $user->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-TEST-DOWNLOAD',
            'amount' => 29000,
            'employee_count' => 10,
            'plan_slug' => 'core',
            'status' => 'paid',
            'payment_gateway' => 'pakasir',
            'payment_method' => 'qris',
            'due_date' => now()->toDateString(),
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->get(route('billing.invoices.download', $invoice));

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment', (string) $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('Invoice_INV-TEST-DOWNLOAD_PAID.pdf', (string) $response->headers->get('Content-Disposition'));
    }
}
