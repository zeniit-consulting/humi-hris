<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SubscriptionRenewalReminderTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_sends_whatsapp_renewal_reminder_seven_days_before_expiry(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-05-18 09:00:00'));

        config()->set('services.kirimdev.enabled', true);
        config()->set('services.kirimdev.base_url', 'https://api.kirimdev.test/v1');
        config()->set('services.kirimdev.api_key', 'secret');
        config()->set('services.kirimdev.subscription_renewal_notification_phone', '6281111111111');

        $user = User::factory()->create([
            'name' => 'Budi Santoso',
            'company_name' => 'PT Test Company',
            'phone' => '6281234567890',
        ]);

        Subscription::query()->create([
            'user_id' => $user->id,
            'plan_slug' => 'core',
            'status' => 'active',
            'employee_count' => 25,
            'current_period_start' => Carbon::today()->subDays(23)->toDateString(),
            'current_period_end' => Carbon::today()->addDays(7)->toDateString(),
        ]);

        Http::fake([
            'https://api.kirimdev.test/v1/messages' => Http::response([
                'id' => 'renewal-reminder-id',
                'status' => 'queued',
            ]),
        ]);

        $this->artisan('subscription:notify-renewal-reminder')
            ->expectsOutput('Reminder renewal selesai. Terkirim: 1.')
            ->assertExitCode(0);

        Http::assertSentCount(2);

        Http::assertSent(function ($request): bool {
            $payload = $request->data();

            return $request->url() === 'https://api.kirimdev.test/v1/messages'
                && $payload['to'] === '+6281234567890'
                && str_contains($payload['text']['body'], 'Reminder Renewal Plan Humi')
                && str_contains($payload['text']['body'], 'Budi Santoso')
                && str_contains($payload['text']['body'], 'PT Test Company')
                && str_contains($payload['text']['body'], 'Basic')
                && str_contains($payload['text']['body'], '25 Mei 2026');
        });

        Http::assertSent(function ($request): bool {
            $payload = $request->data();

            return $request->url() === 'https://api.kirimdev.test/v1/messages'
                && $payload['to'] === '+6281111111111'
                && str_contains($payload['text']['body'], 'Reminder Expired Berlangganan H-7')
                && str_contains($payload['text']['body'], 'PT Test Company')
                && str_contains($payload['text']['body'], 'Budi Santoso')
                && str_contains($payload['text']['body'], 'Basic')
                && str_contains($payload['text']['body'], '25 Mei 2026');
        });

        Carbon::setTestNow();
    }

    public function test_command_still_sends_group_reminder_when_user_phone_is_invalid(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-05-18 09:00:00'));

        config()->set('services.kirimdev.enabled', true);
        config()->set('services.kirimdev.base_url', 'https://api.kirimdev.test/v1');
        config()->set('services.kirimdev.api_key', 'secret');
        config()->set('services.kirimdev.subscription_renewal_notification_phone', '6281111111111');

        $user = User::factory()->create([
            'name' => 'Invalid Phone Owner',
            'company_name' => 'PT Grup Saja',
            'phone' => '123',
        ]);

        Subscription::query()->create([
            'user_id' => $user->id,
            'plan_slug' => 'plus',
            'status' => 'active',
            'employee_count' => 7,
            'current_period_start' => Carbon::today()->subDays(23)->toDateString(),
            'current_period_end' => Carbon::today()->addDays(7)->toDateString(),
        ]);

        Http::fake([
            'https://api.kirimdev.test/v1/messages' => Http::response([
                'status' => 'queued',
            ]),
        ]);

        $this->artisan('subscription:notify-renewal-reminder')
            ->expectsOutput('Reminder renewal selesai. Terkirim: 1.')
            ->assertExitCode(0);

        Http::assertSentCount(1);
        Http::assertSent(function ($request): bool {
            $payload = $request->data();

            return $payload['to'] === '+6281111111111'
                && str_contains($payload['text']['body'], 'PT Grup Saja')
                && str_contains($payload['text']['body'], 'Plus');
        });

        Carbon::setTestNow();
    }

    public function test_command_only_targets_subscriptions_expiring_on_configured_day(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-05-18 09:00:00'));

        config()->set('services.kirimdev.enabled', true);
        config()->set('services.kirimdev.base_url', 'https://api.kirimdev.test/v1');
        config()->set('services.kirimdev.api_key', 'secret');

        $user = User::factory()->create([
            'phone' => '6281234567890',
        ]);

        Subscription::query()->create([
            'user_id' => $user->id,
            'plan_slug' => 'plus',
            'status' => 'active',
            'employee_count' => 10,
            'current_period_start' => Carbon::today()->subDays(20)->toDateString(),
            'current_period_end' => Carbon::today()->addDays(8)->toDateString(),
        ]);

        Http::fake([
            'https://api.kirimdev.test/v1/messages' => Http::response([
                'status' => 'queued',
            ]),
        ]);

        $this->artisan('subscription:notify-renewal-reminder')
            ->expectsOutput('Reminder renewal selesai. Terkirim: 0.')
            ->assertExitCode(0);

        Http::assertNothingSent();

        Carbon::setTestNow();
    }
}
