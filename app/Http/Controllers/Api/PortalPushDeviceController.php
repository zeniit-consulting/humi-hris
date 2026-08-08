<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FcmDeviceToken;
use App\Models\WebPushSubscription;
use App\Services\FcmNotificationService;
use App\Services\WebPushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalPushDeviceController extends Controller
{
    public function storeWebPushSubscription(Request $request, WebPushNotificationService $webPush): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url', 'max:2048'],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth' => ['required', 'string', 'max:255'],
        ]);

        WebPushSubscription::query()->updateOrCreate(
            ['endpoint_hash' => hash('sha256', $validated['endpoint'])],
            [
                'user_id' => $request->user()->id,
                'endpoint' => $validated['endpoint'],
                'endpoint_hash' => hash('sha256', $validated['endpoint']),
                'p256dh' => $validated['keys']['p256dh'],
                'auth' => $validated['keys']['auth'],
                'last_seen_at' => now(),
            ],
        );
        $subscription = WebPushSubscription::query()->where('endpoint_hash', hash('sha256', $validated['endpoint']))->firstOrFail();
        $testSent = $webPush->sendToSubscription(
            $subscription,
            'Notifikasi berhasil diaktifkan',
            'Perangkat ini siap menerima pengingat absensi dari Humi.',
            '/portal/attendance',
        );

        return response()->json([
            'success' => true,
            'message' => 'Subscription Web Push berhasil disimpan.',
            'data' => ['test_notification_sent' => $testSent],
        ]);
    }

    public function destroyWebPushSubscription(Request $request): JsonResponse
    {
        $validated = $request->validate(['endpoint' => ['required', 'url', 'max:2048']]);

        WebPushSubscription::query()
            ->where('user_id', $request->user()->id)
            ->where('endpoint_hash', hash('sha256', $validated['endpoint']))
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subscription Web Push dilepas.',
            'data' => null,
        ]);
    }

    public function store(Request $request, FcmNotificationService $fcm): JsonResponse
    {
        $validated = $request->validate(['token' => ['required', 'string', 'max:4096']]);

        FcmDeviceToken::query()->updateOrCreate(
            ['token' => $validated['token']],
            ['user_id' => $request->user()->id, 'last_seen_at' => now()],
        );

        $testSent = $fcm->sendToToken(
            $validated['token'],
            'Notifikasi berhasil diaktifkan',
            'Perangkat ini siap menerima pengingat absensi dari Humi.',
            '/portal/attendance',
        );

        return response()->json([
            'success' => true,
            'message' => 'Perangkat notifikasi berhasil dihubungkan.',
            'data' => [
                'test_notification_sent' => $testSent,
            ],
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate(['token' => ['required', 'string', 'max:4096']]);

        FcmDeviceToken::query()
            ->where('user_id', $request->user()->id)
            ->where('token', $request->string('token')->toString())
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Perangkat notifikasi dilepas.',
            'data' => null,
        ]);
    }
}
