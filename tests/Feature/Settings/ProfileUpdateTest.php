<?php

namespace Tests\Feature\Settings;

use App\Mail\EmailOtpMail;
use App\Models\CompanySetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('profile.edit'));

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated()
    {
        Mail::fake();
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => $user->phone,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('activation.notice'));

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
        $this->assertNotNull($user->email_otp_code);
        Mail::assertSent(EmailOtpMail::class, fn ($mail): bool => $mail->hasTo('test@example.com'));
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => $user->email,
                'phone' => $user->phone,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_phone_number_is_normalized_without_requiring_reactivation(): void
    {
        Http::fake();

        $user = User::factory()->create([
            'phone' => '6281234567890',
            'phone_verified_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => $user->email,
                'phone' => '0812 0000 1111',
            ]);

        $response->assertRedirect(route('profile.edit'));

        $user->refresh();

        $this->assertSame('6281200001111', $user->phone);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_profile_avatar_can_be_uploaded_to_r2(): void
    {
        Storage::fake('r2');

        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => UploadedFile::fake()->image('avatar.jpg'),
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $user->refresh();

        $this->assertNotNull($user->avatar_path);
        Storage::disk('r2')->assertExists($user->avatar_path);
    }

    public function test_existing_profile_avatar_can_be_removed(): void
    {
        Storage::fake('r2');

        $path = UploadedFile::fake()->image('avatar.jpg')->store('avatars', 'r2');

        $user = User::factory()->create([
            'avatar_path' => $path,
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'remove_avatar' => '1',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $user->refresh();

        $this->assertNull($user->avatar_path);
        Storage::disk('r2')->assertMissing($path);
    }

    public function test_user_can_delete_their_account()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('profile.destroy'), [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('home'));

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->delete(route('profile.destroy'), [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->fresh());
    }

    public function test_company_information_can_be_updated()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('company.update'), [
                'name' => 'PT Maju Jaya',
                'details' => 'Jl. Merdeka No. 1, Jakarta',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertDatabaseHas('company_settings', [
            'name' => 'PT Maju Jaya',
            'details' => 'Jl. Merdeka No. 1, Jakarta',
        ]);

        $this->assertNotNull(CompanySetting::query()->first());
    }
}
