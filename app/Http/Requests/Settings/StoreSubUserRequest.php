<?php

namespace App\Http\Requests\Settings;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreSubUserRequest extends FormRequest
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
        if ($this->filled('employee_id')) {
            $ownerId = $this->user()?->accountOwnerId();
            $employee = Employee::query()->where('user_id', $ownerId)->find($this->input('employee_id'));
            if ($employee) {
                if (! $this->filled('name')) {
                    $this->merge(['name' => $employee->full_name]);
                }
                if (! $this->filled('email') && $employee->email) {
                    $this->merge(['email' => $employee->email]);
                }
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $ownerId = $this->user()?->accountOwnerId();
        $employeeId = $this->input('employee_id');
        $existingUserId = null;

        if ($employeeId) {
            $existingUserId = User::query()
                ->where('parent_user_id', $ownerId)
                ->where(function ($q) use ($employeeId) {
                    $q->where('employee_id', $employeeId)
                        ->orWhere('email', (string) $this->input('email'));
                })
                ->value('id');
        }

        return [
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('user_id', $ownerId)],
            'name' => ['required', 'string', 'max:120'],
            'email' => [
                'required',
                'email',
                'max:150',
                $existingUserId ? Rule::unique('users', 'email')->ignore($existingUserId) : 'unique:users,email',
            ],
            'password' => [$existingUserId ? 'nullable' : 'required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['admin_staff', 'client_supervisor'])],
            'client_sub_company_ids' => ['nullable', 'array'],
            'client_sub_company_ids.*' => ['integer', Rule::exists('sub_companies', 'id')->where('user_id', $ownerId)],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(['attendances', 'schedules', 'leaves', 'overtimes', 'employees', 'payrolls', 'operational'])],
        ];
    }
}
