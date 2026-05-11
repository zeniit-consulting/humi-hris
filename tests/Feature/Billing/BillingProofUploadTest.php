<?php

namespace Tests\Feature\Billing;

use App\Models\SubscriptionInvoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BillingProofUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_payment_proof_to_r2(): void
    {
        Storage::fake('r2');

        $user = User::factory()->create([
            'role' => 'admin',
            'phone_verified_at' => now(),
        ]);

        $invoice = SubscriptionInvoice::query()->create([
            'user_id' => $user->id,
            'subscription_id' => null,
            'invoice_number' => 'INV-TEST-0001',
            'amount' => 29000,
            'employee_count' => 10,
            'plan_slug' => 'core',
            'status' => 'pending',
            'due_date' => now()->addDays(7),
            'paid_at' => null,
            'payment_proof' => null,
            'notes' => null,
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('billing.invoices.proof', $invoice), [
                'payment_proof' => UploadedFile::fake()->image('proof.jpg'),
            ]);

        $response->assertRedirect(route('billing.index'));

        $invoice->refresh();

        $this->assertNotNull($invoice->payment_proof);
        Storage::disk('r2')->assertExists($invoice->payment_proof);
    }
}
