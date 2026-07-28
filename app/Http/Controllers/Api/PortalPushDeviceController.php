<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FcmDeviceToken;
use App\Services\FcmNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalPushDeviceController extends Controller
{
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
