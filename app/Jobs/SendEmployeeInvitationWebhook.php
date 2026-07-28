<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class SendEmployeeInvitationWebhook implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    /**
     * @param  array{
     *     employee_id: string,
     *     company_name: string,
     *     name: string,
     *     division: string,
     *     position: string,
     *     email: string,
     *     phone: string,
     *     username: string,
     *     temporary_password: string,
     *     login_url: string
     * }  $payload
     */
    public function __construct(public readonly array $payload)
    {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        $url = (string) config('services.n8n.staff_invitation.url');
        $username = (string) config('services.n8n.staff_invitation.username');
        $password = (string) config('services.n8n.staff_invitation.password');
        $timeout = (int) config('services.n8n.staff_invitation.timeout', 15);

        if ($url === '' || $username === '' || $password === '') {
            throw new RuntimeException('Konfigurasi webhook invitation n8n belum lengkap.');
        }

        $response = Http::withBasicAuth($username, $password)
            ->acceptJson()
            ->asJson()
            ->timeout($timeout)
            ->post($url, $this->payload);

        if ($response->failed()) {
            Log::warning('n8n.staff_invitation.failed', [
                'employee_id' => $this->payload['employee_id'],
                'status' => $response->status(),
            ]);
        }

        $response->throw();
    }
}
