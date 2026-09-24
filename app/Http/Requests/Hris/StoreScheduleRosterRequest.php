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
        $scope = $this->input('apply_scope') ?? 'single';

        return [
            'apply_scope' => ['nullable', 'string', Rule::in(['single', 'selected', 'all'])],
            'employee_id' => [
                Rule::excludeIf($scope !== 'single'),
                'required',
                'integer',
                Rule::exists('employees', 'id')->where('user_id', $ownerId),
            ],
            'target_employee_ids' => [
                Rule::excludeIf($scope !== 'selected'),
                'required',
                'array',
                'min:1',
            ],
            'target_employee_ids.*' => [
                Rule::excludeIf($scope !== 'selected'),
                'integer',
                Rule::exists('employees', 'id')->where('user_id', $ownerId),
            ],
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

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'employee_id.required' => 'Pilih karyawan yang akan diterapkan jadwal roster.',
            'employee_id.exists' => 'Karyawan yang dipilih tidak valid.',
            'target_employee_ids.required' => 'Pilih minimal satu karyawan tujuan.',
            'target_employee_ids.min' => 'Pilih minimal satu karyawan tujuan.',
            'target_employee_ids.*.exists' => 'Karyawan tujuan tidak valid.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Format tanggal mulai tidak valid.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.date' => 'Format tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'pattern.required' => 'Pola shift wajib diisi.',
            'pattern.min' => 'Pola shift minimal harus memiliki 1 kode shift.',
            'pattern.*.required' => 'Kode shift wajib diisi.',
            'pattern.*.exists' => 'Kode shift :input tidak valid atau tidak ditemukan.',
        ];
    }
}
