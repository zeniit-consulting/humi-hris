<?php

namespace App\Http\Requests\Careers;

use App\Support\WhatsAppPhone;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCareerApplicationRequest extends FormRequest
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

        foreach (['current_salary', 'take_home_pay_min', 'take_home_pay_max', 'expected_salary'] as $field) {
            if (! $this->has($field)) {
                continue;
            }

            $raw = trim((string) $this->input($field));
            if (preg_match('/^\d+\.\d{2}$/', $raw)) {
                $raw = explode('.', $raw)[0];
            }

            $digits = preg_replace('/[^\d]/', '', $raw);
            $normalized[$field] = $digits === '' ? null : $digits;
        }

        if ($this->has('phone')) {
            $normalized['phone'] = WhatsAppPhone::normalize((string) $this->input('phone'));
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
            'full_name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'birth_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:2000'],
            'last_education' => ['nullable', 'string', 'max:100'],
            'years_experience' => ['nullable', 'numeric', 'min:0', 'max:80'],
            'current_company' => ['nullable', 'string', 'max:160'],
            'current_salary' => ['nullable', 'numeric', 'min:0'],
            'take_home_pay_min' => ['nullable', 'numeric', 'min:0'],
            'take_home_pay_max' => ['nullable', 'numeric', 'min:0'],
            'expected_salary' => ['nullable', 'numeric', 'min:0'],
            'expected_join_date' => ['nullable', 'date'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'cover_letter' => ['nullable', 'string', 'max:5000'],
            'resume' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:4096'],
        ];
    }
}
