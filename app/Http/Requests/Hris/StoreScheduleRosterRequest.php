<?php

namespace App\Http\Requests\Hris;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScheduleRosterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('pattern') && is_array($this->input('pattern'))) {
            $this->merge([
                'pattern' => array_values(array_filter(array_map(
                    fn ($item) => is_string($item) ? strtoupper(trim($item)) : $item,
                    $this->input('pattern')
                ), fn ($item) => $item !== '' && $item !== null)),
            ]);
        }
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
            'employee_id' => [
                Rule::requiredIf(fn (): bool => ($this->input('apply_scope') ?? 'single') === 'single'),
                'nullable',
                'integer',
                Rule::exists('employees', 'id')->where('user_id', $ownerId),
            ],
            'apply_scope' => ['nullable', 'string', Rule::in(['single', 'selected', 'all'])],
            'target_employee_ids' => ['required_if:apply_scope,selected', 'array', 'min:1'],
            'target_employee_ids.*' => ['integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'pattern' => ['required', 'array', 'min:1'],
            'pattern.*' => [
                'required',
                'string',
                Rule::exists('work_shifts', 'code')->where('user_id', $ownerId),
            ],
        ];
    }
}
