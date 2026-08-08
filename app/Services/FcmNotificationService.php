<?php

namespace App\Services;

use App\Models\FcmDeviceToken;
use App\Models\User;
use App\Services\WebPushNotificationService;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

class FcmNotificationService
{
    public function sendToToken(string $token, string $title, string $body, string $url): bool
    {
        $credentials = (string) config('services.firebase.credentials');

        if ($credentials === '' || ! is_file($credentials)) {
            Log::warning('fcm.disabled_missing_credentials');

            return false;
        }

        try {
            (new Factory)->withServiceAccount($credentials)->createMessaging()->send(
                CloudMessage::fromArray([
                    'token' => $token,
                    'notification' => ['title' => $title, 'body' => $body],
                    'data' => ['url' => $url],
                    'webpush' => ['fcm_options' => ['link' => $url]],
                ]),
            );

            return true;
        } catch (\Throwable $exception) {
            Log::warning('fcm.send_failed', ['message' => $exception->getMessage()]);

            return false;
        }
    }

    public function sendToUser(User $user, string $title, string $body, string $url): int
    {
        $credentials = (string) config('services.firebase.credentials');
        $sent = 0;

        if ($credentials !== '' && is_file($credentials)) {
            $messaging = (new Factory)->withServiceAccount($credentials)->createMessaging();

            FcmDeviceToken::query()->where('user_id', $user->id)->get()->each(function (FcmDeviceToken $device) use ($messaging, $title, $body, $url, &$sent): void {
                try {
                    $messaging->send(CloudMessage::fromArray([
                        'token' => $device->token,
                        'notification' => ['title' => $title, 'body' => $body],
                        'data' => ['url' => $url],
                        'webpush' => ['fcm_options' => ['link' => $url]],
                    ]));
                    $sent++;
                } catch (\Throwable $exception) {
                    Log::warning('fcm.send_failed', ['token_id' => $device->id, 'message' => $exception->getMessage()]);
                    if (str_contains(strtolower($exception->getMessage()), 'not found')) {
                        $device->delete();
                    }
                }
            });
        } else {
            Log::warning('fcm.disabled_missing_credentials');
        }

        $sent += app(WebPushNotificationService::class)->sendToUser($user->id, $title, $body, $url);

        return $sent;
    }
}
