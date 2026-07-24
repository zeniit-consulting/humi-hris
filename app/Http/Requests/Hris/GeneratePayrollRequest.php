<?php

namespace App\Http\Requests\Hris;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GeneratePayrollRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('service_fee_total')) {
            $this->merge([
                'service_fee_total' => preg_replace('/[^0-9]/', '', (string) $this->input('service_fee_total')),
            ]);
        }
    }
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
        $ownerId = $this->user()?->accountOwnerId();

        return [
            'period' => ['required', 'date_format:Y-m'],
            'employee_scope' => ['nullable', 'in:all,parent_only'],
            'excluded_employee_ids' => ['nullable', 'array'],
            'excluded_employee_ids.*' => [
                'integer',
                Rule::exists('employees', 'id')->where('user_id', $ownerId),
            ],
            'service_fee_total' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
