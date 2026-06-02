<?php

namespace App\Services;

use App\Models\SubscriptionInvoice;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class PakasirPaymentGateway
{
    public const METHODS = [
        'cimb_niaga_va',
        'bni_va',
        'qris',
        'sampoerna_va',
        'bnc_va',
        'maybank_va',
        'permata_va',
        'atm_bersama_va',
        'artha_graha_va',
        'bri_va',
    ];

    public function isConfigured(): bool
    {
        return filled(config('services.pakasir.project'))
            && filled(config('services.pakasir.api_key'));
    }

    public function createTransaction(SubscriptionInvoice $invoice, string $method): array
    {
        if (! in_array($method, self::METHODS, true)) {
            throw new RuntimeException("Metode pembayaran Pakasir tidak valid: {$method}");
        }

        if (! $this->isConfigured()) {
            throw new RuntimeException('Konfigurasi Pakasir belum lengkap.');
        }

        $baseUrl = rtrim((string) config('services.pakasir.base_url'), '/');
        $project = (string) config('services.pakasir.project');

        $response = Http::timeout((int) config('services.pakasir.timeout', 15))
            ->acceptJson()
            ->asJson()
            ->post("{$baseUrl}/api/transactioncreate/{$method}", [
                'project' => $project,
                'order_id' => $invoice->invoice_number,
                'amount' => $invoice->amount,
                'api_key' => (string) config('services.pakasir.api_key'),
            ]);

        if ($response->failed()) {
            Log::warning('pakasir.transaction_create.failed', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'method' => $method,
                'status' => $response->status(),
                'response' => $response->json() ?? $response->body(),
            ]);

            $message = Arr::get((array) $response->json(), 'message')
                ?? Arr::get((array) $response->json(), 'error')
                ?? 'Pakasir menolak pembuatan transaksi.';

            throw new RuntimeException((string) $message);
        }

        $payload = $response->json();

        if (! is_array($payload) || ! is_array(Arr::get($payload, 'payment'))) {
            Log::warning('pakasir.transaction_create.invalid_response', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'method' => $method,
                'status' => $response->status(),
                'response' => $payload ?? $response->body(),
            ]);

            throw new RuntimeException('Respons Pakasir tidak valid.');
        }

        return $payload;
    }

    public function applyTransactionResponse(SubscriptionInvoice $invoice, array $response): SubscriptionInvoice
    {
        $payment = Arr::get($response, 'payment', []);
        $paymentNumber = Arr::get($payment, 'payment_number');

        if (! is_string($paymentNumber) || Str::of($paymentNumber)->trim()->isEmpty()) {
            Log::warning('pakasir.transaction_create.missing_payment_number', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'response' => $response,
            ]);

            throw new RuntimeException('Respons Pakasir tidak menyertakan QRIS/nomor pembayaran.');
        }

        $invoice->update([
            'payment_gateway' => 'pakasir',
            'payment_method' => Arr::get($payment, 'payment_method'),
            'payment_number' => $paymentNumber,
            'payment_fee' => (int) Arr::get($payment, 'fee', 0),
            'total_payment' => Arr::has($payment, 'total_payment') ? (int) Arr::get($payment, 'total_payment') : null,
            'payment_expires_at' => filled(Arr::get($payment, 'expired_at'))
                ? Carbon::parse((string) Arr::get($payment, 'expired_at'))
                : null,
            'payment_payload' => $response,
        ]);

        return $invoice->refresh();
    }

    public function configuredProject(): ?string
    {
        return config('services.pakasir.project');
    }
}
