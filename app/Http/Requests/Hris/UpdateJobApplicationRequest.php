<?php

namespace App\Http\Requests\Hris;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobApplicationRequest extends FormRequest
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
        $normalized = [];

        if ($this->has('take_home_pay_min')) {
            $normalized['take_home_pay_min'] = $this->normalizeCurrencyInput($this->input('take_home_pay_min'));
        }

        if ($this->has('take_home_pay_max')) {
            $normalized['take_home_pay_max'] = $this->normalizeCurrencyInput($this->input('take_home_pay_max'));
        }

        if ($this->has('expected_salary')) {
            $normalized['expected_salary'] = $this->normalizeCurrencyInput($this->input('expected_salary'));
        }

        if ($this->has('offered_salary')) {
            $normalized['offered_salary'] = $this->normalizeCurrencyInput($this->input('offered_salary'));
        }

        if ($normalized !== []) {
            $this->merge($normalized);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'stage' => ['required', Rule::in(['applied', 'screening', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'])],
            'interview_scheduled_at' => ['nullable', 'date'],
            'interviewed_at' => ['nullable', 'date'],
            'interview_notes' => ['nullable', 'string', 'max:5000'],
            'recruiter_notes' => ['nullable', 'string', 'max:5000'],
            'take_home_pay_min' => ['nullable', 'required_with:take_home_pay_max', 'numeric', 'min:0', 'lte:take_home_pay_max'],
            'take_home_pay_max' => ['nullable', 'required_with:take_home_pay_min', 'numeric', 'min:0', 'gte:take_home_pay_min'],
            'expected_salary' => ['nullable', 'numeric', 'min:0'],
            'expected_join_date' => ['nullable', 'date'],
            'offered_salary' => ['nullable', 'numeric', 'min:0'],
            'proposed_start_date' => ['nullable', 'date'],
            'employment_type' => ['nullable', Rule::in(['permanent', 'contract', 'internship', 'freelance'])],
        ];
    }

    private function normalizeCurrencyInput(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = preg_replace('/[^\d]/', '', (string) $value);

        return $normalized === '' ? null : $normalized;
    }
}
