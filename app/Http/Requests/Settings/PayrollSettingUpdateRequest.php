<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class PayrollSettingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'auto_deduct_leave_for_missing_checkout' => $this->boolean('auto_deduct_leave_for_missing_checkout'),
            'auto_overtime_from_attendance' => $this->boolean('auto_overtime_from_attendance'),
            'bpjs_kesehatan_enabled' => $this->boolean('bpjs_kesehatan_enabled'),
            'bpjs_ketenagakerjaan_enabled' => $this->boolean('bpjs_ketenagakerjaan_enabled'),
        ]);
    }

    public function rules(): array
    {
        return [
            'active_working_days' => ['required', 'integer', 'min:1', 'max:31'],
            'auto_deduct_leave_for_missing_checkout' => ['required', 'boolean'],
            'overtime_calculation_mode' => ['sometimes', 'in:hourly,threshold_daily'],
            'overtime_rate_type' => ['sometimes', 'in:formula,fixed'],
            'overtime_fixed_rate_per_hour' => ['nullable', 'numeric', 'min:0'],
            'overtime_threshold_hours' => ['sometimes', 'integer', 'min:1', 'max:24'],
            'overtime_hour_divisor' => ['sometimes', 'integer', 'min:1', 'max:300'],
            'overtime_multiplier_hour1' => ['sometimes', 'numeric', 'min:1', 'max:10'],
            'overtime_multiplier_subsequent' => ['sometimes', 'numeric', 'min:1', 'max:10'],
            'overtime_events' => ['sometimes', 'array'],
            'overtime_events.*.name' => ['required', 'string', 'max:255'],
            'overtime_events.*.nominal' => ['required', 'numeric', 'min:0'],
            'auto_overtime_from_attendance' => ['sometimes', 'boolean'],
            'auto_overtime_min_minutes' => ['sometimes', 'integer', 'min:1', 'max:480'],
            'bpjs_kesehatan_enabled' => ['sometimes', 'boolean'],
            'bpjs_ketenagakerjaan_enabled' => ['sometimes', 'boolean'],
            'bpjs_kesehatan_wage_cap' => ['sometimes', 'numeric', 'min:0'],
            'bpjs_jp_wage_cap' => ['sometimes', 'numeric', 'min:0'],
            'bpjs_jkk_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
