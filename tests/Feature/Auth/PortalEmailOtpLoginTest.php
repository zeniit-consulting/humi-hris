<?php

namespace Tests\Feature\Auth;

use App\Mail\EmailOtpMail;
use App\Models\Division;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PortalEmailOtpLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_request_a_portal_otp_by_registered_email(): void
    {
        Mail::fake();

        $owner = User::factory()->create();
        $division = Division::factory()->create(['user_id' => $owner->id]);
        $position = Position::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
        ]);

        Employee::factory()->create([
            'user_id' => $owner->id,
            'division_id' => $division->id,
            'position_id' => $position->id,
            'email' => 'employee@example.com',
            'phone' => '081234567890',
        ]);

        $this->post(route('portal.login.send-otp'), [
            'email' => 'employee@example.com',
        ])->assertRedirect();

        $portalUser = User::query()
            ->where('role', 'user')
            ->where('email', 'employee@example.com')
            ->firstOrFail();

        $this->assertNotNull($portalUser->email_otp_code);
        $this->assertSame('employee@example.com', session('portal_login_email'));
        Mail::assertSent(EmailOtpMail::class, fn ($mail): bool => $mail->hasTo('employee@example.com'));
    }

    public function test_employee_can_login_to_the_portal_with_a_valid_email_otp(): void
    {
        $owner = User::factory()->create();
        $portalUser = User::factory()->unactivated()->create([
            'role' => 'user',
            'parent_user_id' => $owner->id,
            'email' => 'employee@example.com',
            'email_otp_code' => Hash::make('123456'),
            'email_otp_sent_at' => now(),
            'email_otp_expires_at' => now()->addMinutes(10),
        ]);

        $this->withSession([
            'portal_login_user_id' => $portalUser->id,
            'portal_login_email' => 'employee@example.com',
        ])->post(route('portal.login.verify-otp'), [
            'otp' => '123456',
        ])->assertRedirect(route('portal.index'));

        $this->assertAuthenticatedAs($portalUser);
        $this->assertNotNull($portalUser->fresh()->email_verified_at);
    }
}
