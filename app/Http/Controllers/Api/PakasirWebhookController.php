<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformAuditLog;
use App\Models\SubscriptionInvoice;
use App\Services\PakasirPaymentGateway;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class PakasirWebhookController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
        private readonly PakasirPaymentGateway $pakasir,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'order_id' => ['required', 'string', 'max:120'],
            'project' => ['required', 'string', 'max:120'],
            'status' => ['required', 'string', 'max:40'],
            'payment_method' => ['required', 'string', 'in:'.implode(',', PakasirPaymentGateway::METHODS)],
            'completed_at' => ['nullable', 'date'],
        ]);

        $configuredProject = $this->pakasir->configuredProject();
        if ($configuredProject && $validated['project'] !== $configuredProject) {
            return response()->json(['message' => 'Project tidak sesuai.'], 422);
        }

        $invoice = SubscriptionInvoice::query()
            ->where('invoice_number', $validated['order_id'])
            ->first();

        if (! $invoice) {
            return response()->json(['message' => 'Invoice tidak ditemukan.'], 404);
        }

        if ($invoice->amount !== (int) $validated['amount']) {
            return response()->json(['message' => 'Nominal invoice tidak sesuai.'], 422);
        }

        if ($invoice->payment_gateway !== 'pakasir') {
            return response()->json(['message' => 'Invoice bukan transaksi Pakasir.'], 422);
        }

        if ($validated['status'] !== 'completed') {
            $invoice->update([
                'payment_payload' => array_merge($invoice->payment_payload ?? [], [
                    'webhook' => $validated,
                ]),
            ]);

            return response()->json([
                'message' => 'Webhook diterima, status belum completed.',
                'invoice_status' => $invoice->status,
            ]);
        }

        if ($invoice->status === 'paid') {
            return response()->json([
                'message' => 'Invoice sudah paid.',
                'invoice_status' => $invoice->status,
            ]);
        }

        if ($invoice->status !== 'pending') {
            return response()->json([
                'message' => 'Invoice tidak dapat diproses.',
                'invoice_status' => $invoice->status,
            ], 422);
        }

        try {
            $payload = $this->pakasir->transactionDetail($invoice);
        } catch (\Throwable $exception) {
            Log::warning('pakasir.webhook.transaction_detail_failed', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            report($exception);

            return response()->json([
                'message' => 'Status pembayaran Pakasir belum dapat diverifikasi.',
                'invoice_status' => $invoice->status,
            ], 422);
        }

        $transaction = Arr::get($payload, 'transaction', []);

        if (Arr::get($transaction, 'status') !== 'completed') {
            return response()->json([
                'message' => 'Status pembayaran Pakasir belum completed.',
                'invoice_status' => $invoice->status,
            ], 422);
        }

        if ((int) Arr::get($transaction, 'amount') !== $invoice->amount
            || (string) Arr::get($transaction, 'order_id') !== $invoice->invoice_number
            || (string) Arr::get($transaction, 'project') !== (string) $configuredProject) {
            return response()->json([
                'message' => 'Data pembayaran Pakasir tidak sesuai dengan invoice.',
                'invoice_status' => $invoice->status,
            ], 422);
        }

        $invoice->update([
            'payment_method' => $validated['payment_method'],
            'payment_payload' => array_merge($invoice->payment_payload ?? [], [
                'webhook' => $validated,
                'webhook_transaction_detail' => $transaction,
            ]),
        ]);

        $completedAt = filled($validated['completed_at'] ?? null)
            ? Carbon::parse($validated['completed_at'])
            : now();

        $subscription = $this->subscriptionService->activateSubscription($invoice->refresh(), $completedAt);

        PlatformAuditLog::query()->create([
            'actor_user_id' => null,
            'target_user_id' => $invoice->user_id,
            'target_type' => SubscriptionInvoice::class,
            'target_id' => $invoice->id,
            'action' => 'invoice.pakasir_completed',
            'description' => sprintf('Invoice %s dibayar via Pakasir.', $invoice->invoice_number),
            'metadata' => [
                'invoice_number' => $invoice->invoice_number,
                'amount' => $invoice->amount,
                'payment_method' => $validated['payment_method'],
                'subscription_id' => $subscription->id,
                'completed_at' => $completedAt->toDateTimeString(),
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Pembayaran Pakasir berhasil diproses.',
            'invoice_status' => 'paid',
            'subscription_id' => $subscription->id,
        ]);
    }
}
