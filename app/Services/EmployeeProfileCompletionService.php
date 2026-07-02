<?php

namespace App\Services;

use App\Models\Employee;

class EmployeeProfileCompletionService
{
    /**
     * @return array<string, mixed>
     */
    public function summarize(Employee $employee): array
    {
        $employee->loadMissing('bankAccounts');

        $items = [
            [
                'key' => 'personal_identity',
                'label' => 'Identitas pribadi',
                'complete' => $this->filled($employee->ktp_number),
                'description' => $this->filled($employee->ktp_number)
                    ? 'Nomor KTP sudah terisi'
                    : 'Lengkapi nomor KTP',
            ],
            [
                'key' => 'basic_contact',
                'label' => 'Kontak dasar',
                'complete' => $this->filled($employee->phone),
                'description' => $this->filled($employee->phone)
                    ? 'Nomor telepon sudah terisi'
                    : 'Lengkapi nomor telepon',
            ],
            [
                'key' => 'bpjs',
                'label' => 'BPJS',
                'complete' => $this->filled($employee->bpjs_kesehatan_number)
                    && $this->filled($employee->bpjs_ketenagakerjaan_number),
                'description' => $this->filled($employee->bpjs_kesehatan_number)
                    && $this->filled($employee->bpjs_ketenagakerjaan_number)
                        ? 'Nomor BPJS sudah lengkap'
                        : 'Lengkapi BPJS Kesehatan dan Ketenagakerjaan',
            ],
            [
                'key' => 'emergency_contact',
                'label' => 'Kontak darurat',
                'complete' => $this->filled($employee->emergency_contact_name)
                    && $this->filled($employee->emergency_contact_phone),
                'description' => $this->filled($employee->emergency_contact_name)
                    && $this->filled($employee->emergency_contact_phone)
                        ? 'Kontak darurat sudah lengkap'
                        : 'Lengkapi nama dan nomor kontak darurat',
            ],
            [
                'key' => 'bank_account',
                'label' => 'Rekening bank',
                'complete' => $employee->bankAccounts->contains('is_primary', true),
                'description' => $employee->bankAccounts->contains('is_primary', true)
                    ? 'Rekening utama sudah tersedia'
                    : 'Lengkapi rekening bank utama',
            ],
        ];

        $completed = collect($items)->where('complete', true)->count();
        $total = count($items);

        return [
            'completed' => $completed,
            'total' => $total,
            'missing_count' => $total - $completed,
            'percent' => (int) round(($completed / max($total, 1)) * 100),
            'is_complete' => $completed === $total,
            'items' => $items,
        ];
    }

    private function filled(mixed $value): bool
    {
        return is_string($value)
            ? trim($value) !== ''
            : filled($value);
    }
}
