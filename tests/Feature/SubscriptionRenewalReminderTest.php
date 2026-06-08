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

        config()->set('services.waha.enabled', true);
        config()->set('services.waha.base_url', 'https://waha.example.test');
        config()->set('services.waha.session', 'ZeniConsulting');
        config()->set('services.waha.subscription_renewal_group_chat_id', '120363407707938809@g.us');

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
            'https://waha.example.test/api/sendText' => Http::response([
                'key' => ['id' => 'renewal-reminder-id'],
                'status' => 'PENDING',
            ]),
        ]);

        $this->artisan('subscription:notify-renewal-reminder')
            ->expectsOutput('Reminder renewal selesai. Terkirim: 1.')
            ->assertExitCode(0);

        Http::assertSentCount(2);

        Http::assertSent(function ($request): bool {
            $payload = $request->data();

            return $request->url() === 'https://waha.example.test/api/sendText'
                && $payload['session'] === 'ZeniConsulting'
                && $payload['chatId'] === '6281234567890@c.us'
                && str_contains($payload['text'], 'Reminder Renewal Plan Humi')
                && str_contains($payload['text'], 'Budi Santoso')
                && str_contains($payload['text'], 'PT Test Company')
                && str_contains($payload['text'], 'Basic')
                && str_contains($payload['text'], '25 Mei 2026');
        });

        Http::assertSent(function ($request): bool {
            $payload = $request->data();

            return $request->url() === 'https://waha.example.test/api/sendText'
                && $payload['session'] === 'ZeniConsulting'
                && $payload['chatId'] === '120363407707938809@g.us'
                && str_contains($payload['text'], 'Reminder Expired Berlangganan H-7')
                && str_contains($payload['text'], 'PT Test Company')
                && str_contains($payload['text'], 'Budi Santoso')
                && str_contains($payload['text'], 'Basic')
                && str_contains($payload['text'], '25 Mei 2026');
        });

        Carbon::setTestNow();
    }

    public function test_command_still_sends_group_reminder_when_user_phone_is_invalid(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-05-18 09:00:00'));

        config()->set('services.waha.enabled', true);
        config()->set('services.waha.base_url', 'https://waha.example.test');
        config()->set('services.waha.session', 'ZeniConsulting');
        config()->set('services.waha.subscription_renewal_group_chat_id', '120363407707938809@g.us');

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
            'https://waha.example.test/api/sendText' => Http::response([
                'status' => 'PENDING',
            ]),
        ]);

        $this->artisan('subscription:notify-renewal-reminder')
            ->expectsOutput('Reminder renewal selesai. Terkirim: 1.')
            ->assertExitCode(0);

        Http::assertSentCount(1);
        Http::assertSent(function ($request): bool {
            $payload = $request->data();

            return $payload['chatId'] === '120363407707938809@g.us'
                && str_contains($payload['text'], 'PT Grup Saja')
                && str_contains($payload['text'], 'Plus');
        });

        Carbon::setTestNow();
    }

    public function test_command_only_targets_subscriptions_expiring_on_configured_day(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-05-18 09:00:00'));

        config()->set('services.waha.enabled', true);
        config()->set('services.waha.base_url', 'https://waha.example.test');

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
            'https://waha.example.test/api/sendText' => Http::response([
                'status' => 'PENDING',
            ]),
        ]);

        $this->artisan('subscription:notify-renewal-reminder')
            ->expectsOutput('Reminder renewal selesai. Terkirim: 0.')
            ->assertExitCode(0);

        Http::assertNothingSent();

        Carbon::setTestNow();
    }
}
