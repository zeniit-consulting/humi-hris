<?php

namespace Tests\Unit;

use App\Services\KirimdevClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Tests\TestCase;

class KirimdevClientTest extends TestCase
{
    public function test_send_text_retries_until_success(): void
    {
        config()->set('services.kirimdev.enabled', true);
        config()->set('services.kirimdev.base_url', 'https://api.kirimdev.test/v1');
        config()->set('services.kirimdev.api_key', 'secret');

        Log::spy();

        Http::fake([
            'https://api.kirimdev.test/v1/messages' => Http::sequence()
                ->push(['message' => 'temporarily unavailable'], 503)
                ->push(['message' => 'temporarily unavailable'], 503)
                ->push(['id' => 'abc123', 'status' => 'queued'], 200),
        ]);

        $result = app(KirimdevClient::class)->sendTextToPhone('081234567890', 'Halo');

        $this->assertSame('queued', $result['status']);

        Http::assertSentCount(3);
        Log::shouldHaveReceived('warning')->twice();
        Log::shouldHaveReceived('info')->once();
    }

    public function test_send_text_logs_failure_after_retries_are_exhausted(): void
    {
        config()->set('services.kirimdev.enabled', true);
        config()->set('services.kirimdev.base_url', 'https://api.kirimdev.test/v1');
        config()->set('services.kirimdev.api_key', 'secret');

        Log::spy();

        Http::fake([
            'https://api.kirimdev.test/v1/messages' => Http::response([
                'message' => 'offline',
            ], 503),
        ]);

        $this->expectException(RuntimeException::class);

        try {
            app(KirimdevClient::class)->sendTextToPhone('081234567890', 'Halo');
        } finally {
            Http::assertSentCount(3);
            Log::shouldHaveReceived('error')->once();
        }
    }

    public function test_send_text_posts_kirimdev_payload(): void
    {
        config()->set('services.kirimdev.enabled', true);
        config()->set('services.kirimdev.base_url', 'https://api.kirimdev.test/v1');
        config()->set('services.kirimdev.api_key', 'secret');

        Http::fake([
            'https://api.kirimdev.test/v1/messages' => Http::response([
                'id' => 'message123',
                'status' => 'queued',
            ]),
        ]);

        $result = app(KirimdevClient::class)->sendTextToPhone('081234567890', 'Halo');

        $this->assertSame('queued', $result['status']);

        Http::assertSent(function ($request): bool {
            $payload = $request->data();

            return $request->url() === 'https://api.kirimdev.test/v1/messages'
                && $request->hasHeader('Authorization', 'Bearer secret')
                && $payload['to'] === '+6281234567890'
                && $payload['type'] === 'text'
                && $payload['text']['body'] === 'Halo';
        });
    }

    public function test_send_file_throws_clear_exception_until_document_url_is_available(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Kirimdev document send requires a public document URL or media id');

        app(KirimdevClient::class)->sendFileToPhone('081234567890', 'document.pdf', 'PDF contents');
    }
}
