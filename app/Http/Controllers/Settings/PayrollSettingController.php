<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PayrollSettingUpdateRequest;
use App\Models\CompanySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayrollSettingController extends Controller
{
    public function edit(Request $request): Response
    {
        $setting = $this->settingFor($request);

        return Inertia::render('settings/payroll', [
            'settings' => [
                'active_working_days' => $setting->active_working_days ?? 22,
                'auto_deduct_leave_for_missing_checkout' => (bool) ($setting->auto_deduct_leave_for_missing_checkout ?? false),
                'overtime_calculation_mode' => $setting->overtime_calculation_mode ?? 'hourly',
                'overtime_rate_type' => $setting->overtime_rate_type ?? 'formula',
                'overtime_fixed_rate_per_hour' => $setting->overtime_fixed_rate_per_hour !== null ? (float) $setting->overtime_fixed_rate_per_hour : null,
                'overtime_threshold_hours' => $setting->overtime_threshold_hours ?? 8,
                'overtime_hour_divisor' => $setting->overtime_hour_divisor ?? 173,
                'overtime_multiplier_hour1' => $setting->overtime_multiplier_hour1 ?? 1.5,
                'overtime_multiplier_subsequent' => $setting->overtime_multiplier_subsequent ?? 2.0,
                'overtime_events' => $setting->overtime_events ?? [],
                'auto_overtime_from_attendance' => (bool) ($setting->auto_overtime_from_attendance ?? false),
                'auto_overtime_min_minutes' => $setting->auto_overtime_min_minutes ?? 30,
                'bpjs_kesehatan_enabled' => (bool) ($setting->bpjs_kesehatan_enabled ?? true),
                'bpjs_ketenagakerjaan_enabled' => (bool) ($setting->bpjs_ketenagakerjaan_enabled ?? true),
                'bpjs_kesehatan_wage_cap' => (float) ($setting->bpjs_kesehatan_wage_cap ?? 12000000),
                'bpjs_jp_wage_cap' => (float) ($setting->bpjs_jp_wage_cap ?? 10042300),
                'bpjs_jkk_rate' => (float) ($setting->bpjs_jkk_rate ?? 0.240),
            ],
        ]);
    }

    public function update(PayrollSettingUpdateRequest $request): RedirectResponse
    {
        $this->settingFor($request)->update($request->validated());

        return to_route('settings.payroll.edit')->with('success', 'Pengaturan payroll dan lembur berhasil diperbarui.');
    }

    private function settingFor(Request $request): CompanySetting
    {
        return CompanySetting::query()->firstOrCreate(
            ['user_id' => $request->user()->accountOwnerId()],
            ['name' => 'Perusahaan'],
        );
    }
}
