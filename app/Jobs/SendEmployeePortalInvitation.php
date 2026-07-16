<?php

namespace App\Jobs;

use App\Mail\EmployeePortalInvitationMail;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Support\Facades\Mail;

class SendEmployeePortalInvitation implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(
        public readonly string $email,
        public readonly string $employeeName,
        public readonly string $username,
        public readonly string $temporaryPassword,
        public readonly string $loginUrl,
    ) {
        $this->onQueue('emails');
    }

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [(new RateLimited('transactional-email'))->releaseAfter(30)];
    }

    public function handle(): void
    {
        Mail::to($this->email)->send(new EmployeePortalInvitationMail(
            employeeName: $this->employeeName,
            username: $this->username,
            temporaryPassword: $this->temporaryPassword,
            loginUrl: $this->loginUrl,
        ));
    }
}
