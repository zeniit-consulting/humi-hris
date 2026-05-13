<?php

namespace App\Http\Requests\Hris;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_type' => ['required', 'string', Rule::in([
                'ktp',
                'kk',
                'npwp',
                'bpjs_kesehatan',
                'bpjs_ketenagakerjaan',
                'ijazah',
                'sertifikat',
                'passport',
                'sim',
                'kontrak_kerja',
                'lainnya',
            ])],
            'document_number' => ['nullable', 'string', 'max:120'],
            'issued_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:issued_at'],
            'issuing_authority' => ['nullable', 'string', 'max:150'],
            'document_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:5120'],
            'remove_file' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
