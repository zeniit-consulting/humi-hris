<?php

namespace Tests\Feature\Jobs;

use App\Jobs\SendEmployeeInvitationWebhook;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SendEmployeeInvitationWebhookTest extends TestCase
{
    private array $payload = [
        'employee_id' => 'EMP-001',
        'company_name' => 'Humi Test Company',
        'name' => 'Employee Test',
        'division' => 'Operations',
        'position' => 'Supervisor',
        'email' => 'employee@example.com',
        'phone' => '628123456789',
        'username' => 'EMP-001',
        'temporary_password' => 'temporary-password',
        'login_url' => 'https://humi.example.test/portal/login',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.n8n.staff_invitation', [
            'url' => 'https://n8n.example.test/webhook/staff-invitation',
            'username' => 'test-user',
            'password' => 'test-password',
            'timeout' => 10,
        ]);
    }

    public function test_job_is_encrypted_and_sends_the_complete_invitation_payload_with_basic_auth(): void
    {
        Http::fake([
            'https://n8n.example.test/webhook/staff-invitation' => Http::response(['accepted' => true]),
        ]);

        $job = new SendEmployeeInvitationWebhook($this->payload);

        $this->assertInstanceOf(ShouldBeEncrypted::class, $job);
        $this->assertSame('emails', $job->queue);

        $job->handle();

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://n8n.example.test/webhook/staff-invitation'
                && $request->hasHeader('Authorization', 'Basic '.base64_encode('test-user:test-password'))
                && $request->data() === $this->payload;
        });
    }

    public function test_job_throws_when_n8n_rejects_the_invitation(): void
    {
        Http::fake([
            'https://n8n.example.test/webhook/staff-invitation' => Http::response(['message' => 'failed'], 500),
        ]);

        $this->expectException(RequestException::class);

        (new SendEmployeeInvitationWebhook($this->payload))->handle();
    }
}
