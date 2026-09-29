<?php

namespace App\Http\Requests\Api\Mobile\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'max:20', 'regex:/^(\+?62|0)[0-9]{8,13}$/'],
            'address' => ['required', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Format nomor HP harus valid (contoh: 08123456789 atau +628123456789).',
            'address.required' => 'Alamat tidak boleh kosong.',
        ];
    }
}
