<?php

namespace App\Services;

use App\Support\WhatsAppPhone;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class KirimdevClient
{
    public function sendTextToPhone(string $phone, string $text): array
    {
        return $this->sendText(WhatsAppPhone::normalize($phone), $text);
    }

    /**
     * @return array<string, mixed>
     */
    public function sendFileToPhone(
        string $phone,
        string $filename,
        string $contents,
        string $caption = '',
        string $mimetype = 'application/pdf',
    ): array {
        throw new RuntimeException('Kirimdev document send requires a public document URL or media id; raw file upload is not supported by this client.');
    }

    /**
     * @return array<string, mixed>
     */
    public function sendText(string $target, string $text): array
    {
        $this->ensureEnabled();

        $phone = $this->normalizeTarget($target);

        if (! WhatsAppPhone::isValid($phone)) {
            throw new RuntimeException('Kirimdev only supports direct WhatsApp phone numbers for text messages.');
        }

        return $this->postWithRetry('/messages', [
            'to' => '+'.WhatsAppPhone::normalize($phone),
            'type' => 'text',
            'text' => [
                'body' => $text,
            ],
        ], 'send_text', $phone);
    }

    /**
     * @return array<string, mixed>
     */
    public function sessionSnapshot(): array
    {
        if (! config('services.kirimdev.enabled')) {
            return [
                'provider' => 'kirimdev',
                'status' => 'DISABLED',
            ];
        }

        return [
            'provider' => 'kirimdev',
            'status' => config('services.kirimdev.api_key') ? 'CONFIGURED' : 'MISSING_API_KEY',
            'base_url' => config('services.kirimdev.base_url'),
        ];
    }

    private function request(): PendingRequest
    {
        return Http::baseUrl((string) config('services.kirimdev.base_url', 'https://api.kirimdev.com/v1'))
            ->acceptJson()
            ->asJson()
            ->withToken((string) config('services.kirimdev.api_key'))
            ->timeout((int) config('services.kirimdev.timeout', 15));
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function postWithRetry(string $endpoint, array $payload, string $logAction, string $target): array
    {
        $response = null;
        $lastException = null;

        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                $response = $this->request()
                    ->withHeader('Idempotency-Key', (string) str()->uuid())
                    ->post($endpoint, $payload);

                if ($response->successful()) {
                    $body = $response->json() ?? [];

                    Log::info('kirimdev.'.$logAction.'.sent', [
                        'target' => $target,
                        'attempt' => $attempt,
                        'message_id' => data_get($body, 'id') ?? data_get($body, 'messages.0.id') ?? data_get($body, 'message_id'),
                        'message_status' => data_get($body, 'status'),
                    ]);

                    return $body;
                }

                if (! $this->shouldRetryResponse($response) || $attempt === 3) {
                    break;
                }

                Log::warning('kirimdev.'.$logAction.'.retry', [
                    'target' => $target,
                    'attempt' => $attempt,
                    'status' => $response->status(),
                    'body' => $response->json() ?? $response->body(),
                ]);
            } catch (ConnectionException $exception) {
                $lastException = $exception;

                if ($attempt === 3) {
                    break;
                }

                Log::warning('kirimdev.'.$logAction.'.retry', [
                    'target' => $target,
                    'attempt' => $attempt,
                    'error' => $exception->getMessage(),
                ]);
            }

            usleep($attempt * 300000);
        }

        Log::error('kirimdev.'.$logAction.'.failed', [
            'target' => $target,
            'status' => $response?->status(),
            'body' => $response?->json() ?? $response?->body(),
            'error' => $lastException?->getMessage(),
        ]);

        throw new RuntimeException('Gagal mengirim pesan WhatsApp melalui Kirimdev.');
    }

    private function ensureEnabled(): void
    {
        if (! config('services.kirimdev.enabled')) {
            throw new RuntimeException('Kirimdev integration is disabled.');
        }

        if (! config('services.kirimdev.api_key')) {
            throw new RuntimeException('Kirimdev API key is not configured.');
        }
    }

    private function shouldRetryResponse(Response $response): bool
    {
        return $response->serverError() || $response->status() === 429;
    }

    private function normalizeTarget(string $target): string
    {
        if (str_ends_with($target, '@c.us')) {
            return substr($target, 0, -5);
        }

        return $target;
    }
}
