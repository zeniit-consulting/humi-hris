<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateSubUserRequest extends FormRequest
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
        $subUserId = (int) $this->route('subUser');
        $ownerId = $this->user()?->accountOwnerId();

        return [
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'name' => ['required', 'string', 'max:120'],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($subUserId),
            ],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['admin_staff', 'client_supervisor'])],
            'client_sub_company_ids' => ['nullable', 'array'],
            'client_sub_company_ids.*' => ['integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(['attendances', 'schedules', 'leaves', 'overtimes', 'employees', 'payrolls', 'operational'])],
        ];
    }
}
