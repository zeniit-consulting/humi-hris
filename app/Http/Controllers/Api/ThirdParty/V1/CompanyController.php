<?php

namespace App\Http\Controllers\Api\ThirdParty\V1;

use App\Http\Controllers\Api\ThirdParty\V1\Concerns\InteractsWithThirdPartyApi;
use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    use InteractsWithThirdPartyApi;

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $ownerId = $user->accountOwnerId();
        $setting = CompanySetting::query()->where('user_id', $ownerId)->first();

        return $this->success([
            'id' => $ownerId,
            'name' => $setting?->name ?: $user->company_name,
            'legal_name' => $user->company_name,
            'contact' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'location' => [
                'name' => $setting?->location_name,
                'address' => $setting?->location_address,
                'latitude' => $setting?->location_latitude,
                'longitude' => $setting?->location_longitude,
                'attendance_radius_meters' => $setting?->attendance_radius_meters,
            ],
        ], 'Profil perusahaan berhasil diambil.');
    }
}
