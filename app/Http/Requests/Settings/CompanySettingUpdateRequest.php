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
        $values = [
            'attendance_radius_meters' => $this->input('attendance_radius_meters', 100),
            'attendance_locations' => $this->input('attendance_locations', []),
            'portal_kasbon_enabled' => $this->boolean('portal_kasbon_enabled'),
            'employee_activation_otp_enabled' => $this->boolean('employee_activation_otp_enabled'),
            'show_sub_company_menu' => $this->boolean('show_sub_company_menu'),
            'show_manpower_request_menu' => $this->boolean('show_manpower_request_menu'),
            'show_outsourcing_dashboard' => $this->boolean('show_outsourcing_dashboard'),
        ];

        if ($this->has('auto_deduct_leave_for_missing_checkout')) {
            $values['auto_deduct_leave_for_missing_checkout'] = $this->boolean('auto_deduct_leave_for_missing_checkout');
        }

        $this->merge($values);
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
            'portal_kasbon_enabled' => ['required', 'boolean'],
            'employee_activation_otp_enabled' => ['required', 'boolean'],
            'show_sub_company_menu' => ['required', 'boolean'],
            'show_manpower_request_menu' => ['required', 'boolean'],
            'show_outsourcing_dashboard' => ['required', 'boolean'],
            'auto_deduct_leave_for_missing_checkout' => ['sometimes', 'boolean'],
            'location_name' => ['nullable', 'string', 'max:150'],
            'location_address' => ['nullable', 'string', 'max:1000'],
            'location_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'location_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'attendance_radius_meters' => ['required', 'integer', 'min:10', 'max:100000'],
            'attendance_locations' => ['nullable', 'array', 'max:20'],
            'attendance_locations.*.id' => ['nullable', 'string', 'max:100'],
            'attendance_locations.*.name' => ['required_with:attendance_locations', 'string', 'max:150'],
            'attendance_locations.*.address' => ['nullable', 'string', 'max:1000'],
            'attendance_locations.*.latitude' => ['required_with:attendance_locations', 'numeric', 'between:-90,90'],
            'attendance_locations.*.longitude' => ['required_with:attendance_locations', 'numeric', 'between:-180,180'],
            'attendance_locations.*.radius_meters' => ['required_with:attendance_locations', 'integer', 'min:10', 'max:100000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'overtime_hour_divisor' => ['nullable', 'integer', 'min:1', 'max:300'],
            'overtime_calculation_mode' => ['nullable', 'in:hourly,threshold_daily'],
            'overtime_threshold_hours' => ['nullable', 'integer', 'min:1', 'max:24'],
            'active_working_days' => ['nullable', 'integer', 'min:1', 'max:31'],
            'overtime_multiplier_hour1' => ['nullable', 'numeric', 'min:1', 'max:10'],
            'overtime_multiplier_subsequent' => ['nullable', 'numeric', 'min:1', 'max:10'],
        ];
    }
}
