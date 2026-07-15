<?php

namespace Tests\Feature\Auth;

use App\Mail\EmailOtpMail;
use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailOtpServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_sends_and_persists_a_hashed_email_otp(): void
    {
        Mail::fake();
        $user = User::factory()->unactivated()->create();

        $this->assertTrue(app(EmailOtpService::class)->send($user));

        $user->refresh();
        $this->assertTrue(Hash::check('123456', $user->email_otp_code));
        Mail::assertSent(EmailOtpMail::class, fn ($mail): bool => $mail->hasTo($user->email));
    }

    public function test_it_verifies_a_valid_email_otp_and_clears_the_challenge(): void
    {
        $user = User::factory()->unactivated()->create([
            'email_otp_code' => Hash::make('123456'),
            'email_otp_sent_at' => now(),
            'email_otp_expires_at' => now()->addMinutes(10),
        ]);

        $this->assertTrue(app(EmailOtpService::class)->verify($user, '123456'));
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertNull($user->fresh()->email_otp_code);
    }
}
