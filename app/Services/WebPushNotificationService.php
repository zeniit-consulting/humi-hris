<?php

namespace App\Services;

use App\Models\WebPushSubscription;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushNotificationService
{
    public function sendToSubscription(WebPushSubscription $subscription, string $title, string $body, string $url): bool
    {
        $publicKey = (string) config('services.web_push.public_key');
        $privateKey = (string) config('services.web_push.private_key');
        $subject = (string) config('services.web_push.subject');

        if ($publicKey === '' || $privateKey === '' || $subject === '') {
            Log::warning('web_push.disabled_missing_vapid_config');

            return false;
        }

        try {
            $webPush = new WebPush([
                'VAPID' => [
                    'subject' => $subject,
                    'publicKey' => $publicKey,
                    'privateKey' => $privateKey,
                ],
            ]);
            $report = $webPush->sendOneNotification(
                Subscription::create([
                    'endpoint' => $subscription->endpoint,
                    'keys' => ['p256dh' => $subscription->p256dh, 'auth' => $subscription->auth],
                ]),
                json_encode(['title' => $title, 'body' => $body, 'url' => $url], JSON_THROW_ON_ERROR),
            );

            if (! $report->isSuccess()) {
                Log::warning('web_push.send_failed', ['endpoint' => $subscription->endpoint, 'reason' => (string) $report->getReason()]);

                if ($report->isSubscriptionExpired()) {
                    $subscription->delete();
                }
            }

            return $report->isSuccess();
        } catch (\Throwable $exception) {
            Log::warning('web_push.send_failed', ['endpoint' => $subscription->endpoint, 'message' => $exception->getMessage()]);

            return false;
        }
    }

    public function sendToUser(int $userId, string $title, string $body, string $url): int
    {
        $sent = 0;
        WebPushSubscription::query()->where('user_id', $userId)->get()->each(function (WebPushSubscription $subscription) use ($title, $body, $url, &$sent): void {
            if ($this->sendToSubscription($subscription, $title, $body, $url)) {
                $subscription->update(['last_seen_at' => now()]);
                $sent++;
            }
        });

        return $sent;
    }
}
