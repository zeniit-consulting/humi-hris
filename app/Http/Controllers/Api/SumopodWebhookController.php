<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformAuditLog;
use App\Models\SubscriptionInvoice;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SumopodWebhookController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        \Illuminate\Support\Facades\Log::info('sumopod.webhook.received', [
            'payload' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        $validated = $request->validate([
            'event_type' => ['required', 'string'],
            'data' => ['required', 'array'],
            'data.order_id' => ['required', 'string', 'max:120'],
            'data.amount' => ['required', 'integer', 'min:1'],
            'data.status' => ['required', 'string'],
            'data.payment_id' => ['nullable', 'string'],
            'data.fee' => ['nullable', 'integer'],
            'data.net_amount' => ['nullable', 'integer'],
            'data.payment_method' => ['nullable', 'string'],
            'data.paid_at' => ['nullable', 'string'],
            'data.settled_at' => ['nullable', 'string'],
            'data.completed_at' => ['nullable', 'string'],
        ]);

        $data = $validated['data'];
        $orderId = $data['order_id'];
        $amount = (int) $data['amount'];
        $status = $data['status'];
        $eventType = $validated['event_type'];

        $invoice = SubscriptionInvoice::query()
            ->where('invoice_number', $orderId)
            ->first();

        if (! $invoice) {
            return response()->json(['message' => 'Invoice tidak ditemukan.'], 404);
        }

        $amountMatches = ($invoice->amount === $amount)
            || ($invoice->total_payment === $amount)
            || (isset($data['net_amount']) && $invoice->amount === (int) $data['net_amount']);

        if (! $amountMatches) {
            return response()->json(['message' => 'Nominal invoice tidak sesuai.'], 422);
        }

        if ($invoice->payment_gateway !== 'sumopod') {
            return response()->json(['message' => 'Invoice bukan transaksi Sumopod.'], 422);
        }

        if ($eventType !== 'payment.completed' || $status !== 'completed') {
            $invoice->update([
                'payment_payload' => array_merge($invoice->payment_payload ?? [], [
                    'webhook' => $request->all(),
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

        $fee = (int) ($data['fee'] ?? $invoice->payment_fee ?? 0);
        $totalPayment = $amount + $fee;

        $completedAtRaw = $data['completed_at'] ?? $data['paid_at'] ?? null;
        $completedAt = filled($completedAtRaw)
            ? Carbon::parse($completedAtRaw)
            : now();

        $invoice->update([
            'payment_method' => strtolower((string) ($data['payment_method'] ?? 'qris')),
            'payment_fee' => $fee,
            'total_payment' => $totalPayment,
            'payment_payload' => array_merge($invoice->payment_payload ?? [], [
                'webhook' => $request->all(),
            ]),
        ]);

        $subscription = $this->subscriptionService->activateSubscription($invoice->refresh(), $completedAt);

        PlatformAuditLog::query()->create([
            'actor_user_id' => null,
            'target_user_id' => $invoice->user_id,
            'target_type' => SubscriptionInvoice::class,
            'target_id' => $invoice->id,
            'action' => 'invoice.sumopod_completed',
            'description' => sprintf('Invoice %s dibayar via Sumopod.', $invoice->invoice_number),
            'metadata' => [
                'invoice_number' => $invoice->invoice_number,
                'amount' => $invoice->amount,
                'fee' => $fee,
                'payment_method' => $invoice->payment_method,
                'payment_id' => $data['payment_id'] ?? null,
                'subscription_id' => $subscription->id,
                'completed_at' => $completedAt->toDateTimeString(),
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Pembayaran Sumopod berhasil diproses.',
            'invoice_status' => 'paid',
            'subscription_id' => $subscription->id,
        ]);
    }
}
