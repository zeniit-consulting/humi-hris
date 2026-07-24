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
                'overtime_threshold_hours' => $setting->overtime_threshold_hours ?? 8,
                'overtime_hour_divisor' => $setting->overtime_hour_divisor ?? 173,
                'overtime_multiplier_hour1' => $setting->overtime_multiplier_hour1 ?? 1.5,
                'overtime_multiplier_subsequent' => $setting->overtime_multiplier_subsequent ?? 2.0,
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
