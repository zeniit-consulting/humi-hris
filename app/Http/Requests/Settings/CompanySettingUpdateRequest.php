<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CompanySettingUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare request data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'attendance_radius_meters' => $this->input('attendance_radius_meters', 100),
            'attendance_locations' => $this->input('attendance_locations', []),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'details' => ['nullable', 'string', 'max:3000'],
            'location_name' => ['nullable', 'string', 'max:150'],
            'location_address' => ['nullable', 'string', 'max:1000'],
            'location_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'location_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'attendance_radius_meters' => ['required', 'integer', 'min:10', 'max:100000'],
            'attendance_locations' => ['nullable', 'array', 'max:20'],
            'attendance_locations.*.name' => ['required_with:attendance_locations', 'string', 'max:150'],
            'attendance_locations.*.address' => ['nullable', 'string', 'max:1000'],
            'attendance_locations.*.latitude' => ['required_with:attendance_locations', 'numeric', 'between:-90,90'],
            'attendance_locations.*.longitude' => ['required_with:attendance_locations', 'numeric', 'between:-180,180'],
            'attendance_locations.*.radius_meters' => ['required_with:attendance_locations', 'integer', 'min:10', 'max:100000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'overtime_hour_divisor' => ['nullable', 'integer', 'min:1', 'max:300'],
            'overtime_multiplier_hour1' => ['nullable', 'numeric', 'min:1', 'max:10'],
            'overtime_multiplier_subsequent' => ['nullable', 'numeric', 'min:1', 'max:10'],
        ];
    }
}
