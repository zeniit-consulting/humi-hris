<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WhatsappTestPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_whatsapp_test_page_can_be_rendered(): void
    {
        $this->withoutVite();

        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('settings.whatsapp.show'))
            ->assertOk();
    }

    public function test_admin_can_send_whatsapp_test_message(): void
    {
        config()->set('services.kirimdev.enabled', true);
        config()->set('services.kirimdev.base_url', 'https://api.kirimdev.test/v1');
        config()->set('services.kirimdev.api_key', 'secret');

        Http::fake([
            'https://api.kirimdev.test/v1/messages' => Http::response([
                'id' => 'abc123',
                'status' => 'queued',
            ], 200),
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('settings.whatsapp.send'), [
                'phone' => '081234567890',
                'message' => 'Halo dari halaman admin.',
            ])
            ->assertRedirect();

        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.kirimdev.test/v1/messages'
                && $request->hasHeader('Authorization', 'Bearer secret')
                && $request['to'] === '+6281234567890'
                && $request['type'] === 'text'
                && $request['text']['body'] === 'Halo dari halaman admin.';
        });
    }
}
