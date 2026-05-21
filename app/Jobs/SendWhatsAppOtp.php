<?php

namespace App\Jobs;

use App\Services\WahaClient;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Support\Facades\Log;

class SendWhatsAppOtp implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public readonly string $phone,
        public readonly string $message,
    ) {}

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        $delaySeconds = max(1, (int) config('services.waha.otp_send_delay_seconds', 30));

        return [(new RateLimited('whatsapp-otp'))->releaseAfter($delaySeconds)];
    }

    public function handle(WahaClient $wahaClient): void
    {
        $wahaClient->sendTextToPhone($this->phone, $this->message);

        Log::info('waha.otp.sent', [
            'phone' => $this->phone,
        ]);
    }

    public function rateLimitKey(): string
    {
        return 'whatsapp-otp:'.$this->phone;
    }
}
