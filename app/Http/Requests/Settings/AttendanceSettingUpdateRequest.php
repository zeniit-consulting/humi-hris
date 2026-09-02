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
        ];
    }
}
