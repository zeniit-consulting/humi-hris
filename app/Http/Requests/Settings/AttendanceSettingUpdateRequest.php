<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttendanceSettingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'missing_clock_out_request_days' => ['required', 'integer', 'min:0', 'max:31'],
            'require_face_recognition' => ['nullable', 'boolean'],
            'attendance_revision_cutoff_day' => [
                'required',
                Rule::in([
                    'end_of_month',
                    ...array_map(static fn (int $day): string => (string) $day, range(1, 28)),
                ]),
            ],
            'late_penalty_enabled' => ['nullable', 'boolean'],
            'late_tolerance_minutes' => ['nullable', 'integer', 'min:0', 'max:480'],
            'late_penalty_type' => ['nullable', 'string', 'in:tiered,progressive'],
            'late_penalty_tiers' => ['nullable', 'array'],
            'late_penalty_tiers.*.from_minute' => ['nullable', 'integer', 'min:0'],
            'late_penalty_tiers.*.to_minute' => ['nullable', 'integer', 'min:0'],
            'late_penalty_tiers.*.penalty_amount' => ['nullable', 'numeric', 'min:0'],
            'late_penalty_tiers.*.description' => ['nullable', 'string', 'max:100'],
            'late_base_penalty_minutes' => ['nullable', 'integer', 'min:0'],
            'late_base_penalty_amount' => ['nullable', 'numeric', 'min:0'],
            'late_incremental_penalty_amount' => ['nullable', 'numeric', 'min:0'],
            'late_incremental_unit_minutes' => ['nullable', 'integer', 'min:1', 'max:60'],
            'late_half_day_enabled' => ['nullable', 'boolean'],
            'late_half_day_cutoff_minutes' => ['nullable', 'integer', 'min:1', 'max:480'],
            'late_half_day_penalty_amount' => ['nullable', 'numeric', 'min:0'],
            'late_half_day_penalty_type' => ['nullable', 'string', 'in:nominal,prorate_half_day'],
            'late_half_day_deduct_leave' => ['nullable', 'boolean'],
            'unrecorded_cutoff_penalty_enabled' => ['nullable', 'boolean'],
        ];
    }
}
