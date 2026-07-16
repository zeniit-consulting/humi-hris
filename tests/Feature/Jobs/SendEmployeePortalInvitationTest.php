<?php

namespace Tests\Feature\Jobs;

use App\Jobs\SendEmployeePortalInvitation;
use App\Mail\EmployeePortalInvitationMail;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SendEmployeePortalInvitationTest extends TestCase
{
    public function test_job_is_encrypted_rate_limited_and_sends_the_invitation_template(): void
    {
        Mail::fake();

        $job = new SendEmployeePortalInvitation(
            email: 'employee@example.com',
            employeeName: 'Employee Test',
            username: 'EMP-001',
            temporaryPassword: 'temporary-password',
            loginUrl: 'https://humi.my.id/portal/login',
        );

        $this->assertInstanceOf(ShouldBeEncrypted::class, $job);
        $this->assertSame('emails', $job->queue);
        $this->assertInstanceOf(RateLimited::class, $job->middleware()[0]);

        $job->handle();

        Mail::assertSent(
            EmployeePortalInvitationMail::class,
            fn (EmployeePortalInvitationMail $mail): bool => $mail->hasTo('employee@example.com')
                && $mail->username === 'EMP-001',
        );
    }
}
