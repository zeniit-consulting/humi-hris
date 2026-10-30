<?php

namespace App\Services;

use App\Models\SubscriptionInvoice;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class SumopodPaymentGateway
{
    public function mode(): string
    {
        $mode = config('services.sumopod.mode');
        if (filled($mode)) {
            return strtolower((string) $mode) === 'production' ? 'production' : 'sandbox';
        }

        return config('services.sumopod.sandbox', true) ? 'sandbox' : 'production';
    }

    public function isSandbox(): bool
    {
        return $this->mode() === 'sandbox';
    }

    public function isProduction(): bool
    {
        return $this->mode() === 'production';
    }

    public function baseUrl(): string
    {
        if (filled(config('services.sumopod.base_url'))) {
            return rtrim((string) config('services.sumopod.base_url'), '/');
        }

        return $this->isSandbox()
            ? rtrim((string) config('services.sumopod.sandbox_base_url', 'https://api-pay-sandbox.sumopod.com'), '/')
            : rtrim((string) config('services.sumopod.production_base_url', 'https://api-pay.sumopod.com'), '/');
    }

    public function apiKey(): ?string
    {
        if ($this->isSandbox() && filled(config('services.sumopod.sandbox_api_key'))) {
            return (string) config('services.sumopod.sandbox_api_key');
        }

        if ($this->isProduction() && filled(config('services.sumopod.production_api_key'))) {
            return (string) config('services.sumopod.production_api_key');
        }

        $fallback = config('services.sumopod.api_key');

        return filled($fallback) ? (string) $fallback : null;
    }

    public function isConfigured(): bool
    {
        return filled($this->apiKey());
    }

    public function createPayment(SubscriptionInvoice $invoice, ?string $successUrl = null, ?string $cancelUrl = null): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException("Konfigurasi Sumopod ({$this->mode()}) belum lengkap. Isi API Key.");
        }

        $baseUrl = $this->baseUrl();
        $apiKey = (string) $this->apiKey();

        $successReturnUrl = $successUrl ?: route('billing.invoices.payment', ['invoice' => $invoice->id]);
        $cancelReturnUrl = $cancelUrl ?: route('billing.index');

        // Sumopod validator requires https:// for redirect URLs
        if (Str::startsWith($successReturnUrl, 'http://')) {
            $successReturnUrl = 'https://'.substr($successReturnUrl, 7);
        }
        if (Str::startsWith($cancelReturnUrl, 'http://')) {
            $cancelReturnUrl = 'https://'.substr($cancelReturnUrl, 7);
        }

        $payload = [
            'order_id' => $invoice->invoice_number,
            'amount' => (int) $invoice->amount,
            'currency' => 'IDR',
            'expires_in_hours' => 24,
            'success_return_url' => $successReturnUrl,
            'cancel_return_url' => $cancelReturnUrl,
            'payment_method_type_code' => 'QRIS',
        ];

        $response = Http::timeout((int) config('services.sumopod.timeout', 15))
            ->acceptJson()
            ->withHeaders([
                'X-Api-Key' => $apiKey,
            ])
            ->post("{$baseUrl}/api/v1/payments", $payload);

        if ($response->failed()) {
            Log::warning('sumopod.payment_create.failed', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'status' => $response->status(),
                'response' => $response->json() ?? $response->body(),
            ]);

            $message = Arr::get((array) $response->json(), 'message')
                ?? Arr::get((array) $response->json(), 'error')
                ?? 'Sumopod menolak pembuatan pembayaran QRIS.';

            throw new RuntimeException((string) $message);
        }

        $responseData = $response->json();

        if (! is_array($responseData)) {
            Log::warning('sumopod.payment_create.invalid_response', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            throw new RuntimeException('Respons Sumopod tidak valid.');
        }

        return $responseData;
    }

    public function applyPaymentResponse(SubscriptionInvoice $invoice, array $response): SubscriptionInvoice
    {
        $data = Arr::get($response, 'data', $response);
        $paymentNumber = $this->paymentNumberFrom($response);

        $fee = (int) (Arr::get($data, 'fee') ?? Arr::get($response, 'fee', 0));
        $totalPayment = Arr::has($data, 'total_payment')
            ? (int) Arr::get($data, 'total_payment')
            : (Arr::has($data, 'amount') && (int) Arr::get($data, 'amount') > $invoice->amount
                ? (int) Arr::get($data, 'amount')
                : ($invoice->amount + $fee));

        $expiresAt = filled(Arr::get($data, 'expires_at'))
            ? Carbon::parse((string) Arr::get($data, 'expires_at'))
            : now()->addHours(24);

        $invoice->update([
            'payment_gateway' => 'sumopod',
            'payment_method' => 'qris',
            'payment_number' => $paymentNumber,
            'payment_fee' => $fee,
            'total_payment' => $totalPayment,
            'payment_expires_at' => $expiresAt,
            'payment_payload' => array_merge($response, [
                '_environment' => $this->mode(),
            ]),
        ]);

        return $invoice->refresh();
    }

    public function paymentUrl(SubscriptionInvoice $invoice): ?string
    {
        $payload = $invoice->payment_payload ?? [];

        $candidates = [
            Arr::get($payload, 'data.payment_link_url'),
            Arr::get($payload, 'payment_link_url'),
            Arr::get($payload, 'data.payment_url'),
            Arr::get($payload, 'data.checkout_url'),
            Arr::get($payload, 'payment_url'),
            Arr::get($payload, 'checkout_url'),
        ];

        foreach ($candidates as $url) {
            if (is_string($url) && Str::startsWith($url, ['http://', 'https://'])) {
                return $url;
            }
        }

        if (is_string($invoice->payment_number) && Str::startsWith($invoice->payment_number, ['http://', 'https://'])) {
            return $invoice->payment_number;
        }

        return null;
    }

    public function checkPaymentStatus(SubscriptionInvoice $invoice): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Konfigurasi Sumopod belum lengkap.');
        }

        $baseUrl = $this->baseUrl();
        $apiKey = (string) $this->apiKey();

        $paymentId = Arr::get($invoice->payment_payload, 'data.payment_id')
            ?? Arr::get($invoice->payment_payload, 'payment_id')
            ?? Arr::get($invoice->payment_payload, 'data.id')
            ?? Arr::get($invoice->payment_payload, 'id');

        $url = $paymentId
            ? "{$baseUrl}/api/v1/payments/{$paymentId}"
            : "{$baseUrl}/api/v1/payments?order_id={$invoice->invoice_number}";

        $response = Http::timeout((int) config('services.sumopod.timeout', 15))
            ->acceptJson()
            ->withHeaders(['X-Api-Key' => $apiKey])
            ->get($url);

        if ($response->status() === 404) {
            return [
                'status' => 'pending',
                'order_id' => $invoice->invoice_number,
                'amount' => $invoice->amount,
                'message' => 'Status pembayaran akan diperbarui secara otomatis via webhook saat pembayaran selesai.',
            ];
        }

        if ($response->failed()) {
            Log::warning('sumopod.payment_status.failed', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'status' => $response->status(),
                'response' => $response->json() ?? $response->body(),
            ]);

            $message = Arr::get((array) $response->json(), 'message')
                ?? Arr::get((array) $response->json(), 'error')
                ?? 'Status pembayaran Sumopod belum dapat dicek.';

            throw new RuntimeException((string) $message);
        }

        $payload = $response->json();

        if (! is_array($payload)) {
            throw new RuntimeException('Respons status pembayaran Sumopod tidak valid.');
        }

        return $payload;
    }

    private function paymentNumberFrom(array $payload): ?string
    {
        $candidates = [
            Arr::get($payload, 'data.payment_code'),
            Arr::get($payload, 'payment_code'),
            Arr::get($payload, 'data.qr_string'),
            Arr::get($payload, 'data.qr_content'),
            Arr::get($payload, 'data.qris'),
            Arr::get($payload, 'data.qris_string'),
            Arr::get($payload, 'data.qris_content'),
            Arr::get($payload, 'data.qr_code'),
            Arr::get($payload, 'data.qr_url'),
            Arr::get($payload, 'data.payment_link_url'),
            Arr::get($payload, 'payment_link_url'),
            Arr::get($payload, 'data.payment_url'),
            Arr::get($payload, 'data.checkout_url'),
            Arr::get($payload, 'data.payment_number'),
            Arr::get($payload, 'qr_string'),
            Arr::get($payload, 'qr_content'),
            Arr::get($payload, 'qris'),
            Arr::get($payload, 'qris_string'),
            Arr::get($payload, 'qr_code'),
            Arr::get($payload, 'payment_url'),
            Arr::get($payload, 'checkout_url'),
            Arr::get($payload, 'payment_number'),
        ];

        foreach ($candidates as $value) {
            if (is_string($value) && Str::of($value)->trim()->isNotEmpty()) {
                return $value;
            }
        }

        return null;
    }
}
