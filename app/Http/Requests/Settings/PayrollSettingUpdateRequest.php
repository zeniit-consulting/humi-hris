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
        ]);
    }

    public function rules(): array
    {
        return [
            'active_working_days' => ['required', 'integer', 'min:1', 'max:31'],
            'auto_deduct_leave_for_missing_checkout' => ['required', 'boolean'],
            'overtime_calculation_mode' => ['required', 'in:hourly,threshold_daily'],
            'overtime_threshold_hours' => ['required', 'integer', 'min:1', 'max:24'],
            'overtime_hour_divisor' => ['required', 'integer', 'min:1', 'max:300'],
            'overtime_multiplier_hour1' => ['required', 'numeric', 'min:1', 'max:10'],
            'overtime_multiplier_subsequent' => ['required', 'numeric', 'min:1', 'max:10'],
        ];
    }
}
