<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\FcmDeviceToken;
use App\Models\User;
use App\Services\FcmNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FcmPushDeviceTest extends TestCase
{
    use RefreshDatabase;

    public function test_portal_user_can_register_and_remove_a_fcm_device_token(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $token = str_repeat('a', 180);
        $service = \Mockery::mock(FcmNotificationService::class);
        $service->shouldReceive('sendToToken')
            ->once()
            ->with($token, 'Notifikasi berhasil diaktifkan', \Mockery::type('string'), '/portal/attendance')
            ->andReturn(true);
        $this->app->instance(FcmNotificationService::class, $service);

        $this->actingAs($user)
            ->postJson('/portal/api/push-devices', ['token' => $token])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.test_notification_sent', true);

        $this->assertDatabaseHas('fcm_device_tokens', ['user_id' => $user->id, 'token' => $token]);

        $this->actingAs($user)
            ->deleteJson('/portal/api/push-devices', ['token' => $token])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('fcm_device_tokens', ['token' => $token]);
    }

    public function test_portal_profile_reports_whether_push_notifications_are_already_active(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $portalUser = User::factory()->create([
            'email' => 'portal+push@local.portal',
            'phone' => '081234567890',
            'parent_user_id' => $owner->id,
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        Employee::factory()->create([
            'user_id' => $owner->id,
            'phone' => '081234567890',
        ]);

        $this->actingAs($portalUser)
            ->getJson('/portal/api/profile')
            ->assertOk()
            ->assertJsonPath('data.has_push_notification_device', false);

        FcmDeviceToken::query()->create([
            'user_id' => $portalUser->id,
            'token' => str_repeat('b', 180),
            'last_seen_at' => now(),
        ]);

        $this->actingAs($portalUser)
            ->getJson('/portal/api/profile')
            ->assertOk()
            ->assertJsonPath('data.has_push_notification_device', true);
    }
}
