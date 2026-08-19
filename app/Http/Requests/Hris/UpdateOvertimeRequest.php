<?php

namespace App\Http\Requests\Hris;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOvertimeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $ownerId = $this->user()->accountOwnerId();

        return [
            'employee_id' => ['required', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'work_date' => ['required', 'date'],
            'is_event' => ['nullable', 'boolean'],
            'event_name' => ['nullable', 'required_if:is_event,true', 'string', 'max:255'],
            'start_time' => ['nullable', 'required_if:is_event,false', 'date_format:H:i'],
            'end_time' => ['nullable', 'required_if:is_event,false', 'date_format:H:i'],
            'break_minutes' => ['nullable', 'integer', 'min:0', 'max:480'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'notes' => ['nullable', 'string', 'max:255'],
        ];
    }
}
