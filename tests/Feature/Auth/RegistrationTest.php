<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'company_name' => 'PT Test Company',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('activation.notice'));

        $user = User::query()->firstOrFail();

        $this->assertSame('admin', $user->role);
        $this->assertSame('PT Test Company', $user->company_name);
        $this->assertSame('6281234567890', $user->phone);
        $this->assertNull($user->phone_verified_at);
        $this->assertNotNull($user->whatsapp_otp_code);

        $this->assertDatabaseHas('company_settings', [
            'user_id' => $user->id,
            'name' => 'PT Test Company',
        ]);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan_slug' => 'free',
            'status' => 'trial',
            'current_period_start' => Carbon::today()->toDateTimeString(),
            'current_period_end' => Carbon::today()->addDays(30)->toDateTimeString(),
            'trial_ends_at' => Carbon::today()->addDays(30)->toDateTimeString(),
        ]);

        foreach (['OFF', '0817', '0918', '1701', '0008'] as $code) {
            $this->assertDatabaseHas('work_shifts', [
                'user_id' => $user->id,
                'code' => $code,
            ]);
        }
    }

    public function test_registration_rejects_invalid_whatsapp_number_format(): void
    {
        $response = $this->from(route('register'))->post(route('register.store'), [
            'name' => 'Test User',
            'company_name' => 'PT Test Company',
            'email' => 'test@example.com',
            'phone' => '015981415513',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('register'));
        $response->assertSessionHasErrors(['phone']);
        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_sends_whatsapp_message_to_registration_group(): void
    {
        config()->set('services.kirimdev.enabled', true);
        config()->set('services.kirimdev.base_url', 'https://api.kirimdev.test/v1');
        config()->set('services.kirimdev.api_key', 'secret');
        config()->set('services.kirimdev.registration_notification_phone', '6281111111111');

        Http::fake([
            'https://api.kirimdev.test/v1/messages' => Http::response([
                'id' => 'message-id',
                'status' => 'queued',
            ]),
        ]);

        $this->post(route('register.store'), [
            'name' => 'Test User',
            'company_name' => 'PT Test Company',
            'email' => 'test-group@example.com',
            'phone' => '081234567890',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        Http::assertSent(function ($request): bool {
            $payload = $request->data();

            return $request->url() === 'https://api.kirimdev.test/v1/messages'
                && $payload['to'] === '+6281111111111'
                && str_contains($payload['text']['body'], 'Registrasi Akun Baru')
                && str_contains($payload['text']['body'], 'PT Test Company')
                && str_contains($payload['text']['body'], 'test-group@example.com')
                && str_contains($payload['text']['body'], '6281234567890');
        });
    }
}
