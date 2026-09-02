<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AttendanceSettingUpdateRequest;
use App\Models\CompanySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceSettingController extends Controller
{
    public function edit(Request $request): Response
    {
        $setting = $this->settingFor($request);

        return Inertia::render('settings/attendance', [
            'settings' => [
                'missing_clock_out_request_days' => $setting->missing_clock_out_request_days ?? 2,
                'require_face_recognition' => (bool) ($setting->require_face_recognition ?? false),
                'attendance_revision_cutoff_day' => $setting->attendance_revision_cutoff_day ?? 'end_of_month',
            ],
        ]);
    }

    public function update(AttendanceSettingUpdateRequest $request): RedirectResponse
    {
        $this->settingFor($request)->update($request->validated());

        return to_route('settings.attendance.edit')
            ->with('success', 'Pengaturan absensi berhasil diperbarui.');
    }

    private function settingFor(Request $request): CompanySetting
    {
        return CompanySetting::query()->firstOrCreate(
            ['user_id' => $request->user()->accountOwnerId()],
            ['name' => 'Perusahaan'],
        );
    }
}
