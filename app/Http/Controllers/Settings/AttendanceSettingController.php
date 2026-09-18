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
                'late_penalty_enabled' => (bool) ($setting->late_penalty_enabled ?? false),
                'late_tolerance_minutes' => (int) ($setting->late_tolerance_minutes ?? 15),
                'late_penalty_type' => $setting->late_penalty_type ?? 'tiered',
                'late_penalty_tiers' => $setting->late_penalty_tiers ?? [
                    ['from_minute' => 1, 'to_minute' => 15, 'penalty_amount' => 0, 'description' => 'Toleransi'],
                    ['from_minute' => 16, 'to_minute' => 30, 'penalty_amount' => 20000, 'description' => 'Terlambat 16-30 menit'],
                    ['from_minute' => 31, 'to_minute' => 60, 'penalty_amount' => 50000, 'description' => 'Terlambat 31-60 menit'],
                ],
                'late_base_penalty_minutes' => (int) ($setting->late_base_penalty_minutes ?? 15),
                'late_base_penalty_amount' => (float) ($setting->late_base_penalty_amount ?? 0),
                'late_incremental_penalty_amount' => (float) ($setting->late_incremental_penalty_amount ?? 0),
                'late_incremental_unit_minutes' => (int) ($setting->late_incremental_unit_minutes ?? 1),
                'late_half_day_enabled' => (bool) ($setting->late_half_day_enabled ?? false),
                'late_half_day_cutoff_minutes' => (int) ($setting->late_half_day_cutoff_minutes ?? 60),
                'late_half_day_penalty_amount' => (float) ($setting->late_half_day_penalty_amount ?? 0),
                'late_half_day_deduct_leave' => (bool) ($setting->late_half_day_deduct_leave ?? true),
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
