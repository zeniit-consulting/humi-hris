<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EmailActivationTest extends TestCase
{
    use RefreshDatabase;

    public function test_activation_screen_shows_the_unactivated_users_email(): void
    {
        $this->withoutVite();

        $user = User::factory()->unactivated()->create([
            'email' => 'activation@example.com',
        ]);

        $this->actingAs($user)
            ->get(route('activation.notice'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/activate-account')
                ->where('email', 'activation@example.com')
            );
    }

    public function test_user_can_activate_account_with_a_valid_email_otp(): void
    {
        $user = User::factory()->unactivated()->create([
            'email_otp_code' => bcrypt('123456'),
            'email_otp_expires_at' => now()->addMinutes(10),
            'email_otp_sent_at' => now(),
        ]);

        $this->actingAs($user)
            ->post(route('activation.verify'), ['otp' => '123456'])
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertNull($user->fresh()->email_otp_code);
    }

    public function test_user_cannot_activate_account_with_an_invalid_email_otp(): void
    {
        $user = User::factory()->unactivated()->create([
            'email_otp_code' => bcrypt('123456'),
            'email_otp_expires_at' => now()->addMinutes(10),
            'email_otp_sent_at' => now(),
        ]);

        $this->actingAs($user)
            ->from(route('activation.notice'))
            ->post(route('activation.verify'), ['otp' => '999999'])
            ->assertRedirect(route('activation.notice'))
            ->assertSessionHasErrors(['otp']);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_user_can_resend_an_email_otp(): void
    {
        Mail::fake();

        $user = User::factory()->unactivated()->create([
            'email_otp_sent_at' => now()->subMinutes(2),
        ]);

        $this->actingAs($user)
            ->post(route('activation.send'))
            ->assertRedirect();

        $this->assertNotNull($user->fresh()->email_otp_code);
        Mail::assertSent(\App\Mail\EmailOtpMail::class, fn ($mail): bool => $mail->hasTo($user->email));
    }
}
