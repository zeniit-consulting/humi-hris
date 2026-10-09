<?php

namespace App\Services;

use App\Models\CareerTransition;
use App\Models\CompanySetting;
use App\Models\Division;
use App\Models\Employee;
use App\Models\Position;
use App\Models\SubCompany;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CareerTransitionService
{
    public function __construct(
        protected EmployeeEmploymentHistoryService $historyService
    ) {}

    public function generateTransitionNumber(int $ownerId, string $date): string
    {
        $period = Carbon::parse($date)->format('Ym');
        $prefix = "MUT-{$period}-";

        $count = CareerTransition::query()
            ->where('user_id', $ownerId)
            ->where('transition_number', 'like', "{$prefix}%")
            ->count();

        $sequence = str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$sequence}";
    }

    public function generateSkNumber(int $ownerId, string $date, string $type): string
    {
        $carbon = Carbon::parse($date);
        $year = $carbon->format('Y');
        $monthRoman = $this->romanMonth((int) $carbon->format('n'));

        $typeCode = match ($type) {
            CareerTransition::TYPE_PROMOTION => 'PROM',
            CareerTransition::TYPE_DEMOTION => 'DEM',
            CareerTransition::TYPE_MUTATION => 'MUT',
            CareerTransition::TYPE_ROTATION => 'ROT',
            CareerTransition::TYPE_SALARY_ADJUSTMENT => 'ADJ',
            default => 'SK',
        };

        $prefix = "SK/{$typeCode}/{$year}/";

        $count = CareerTransition::query()
            ->where('user_id', $ownerId)
            ->whereNotNull('letter_number')
            ->where('letter_number', 'like', "{$prefix}%")
            ->count();

        $sequence = str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$monthRoman}/{$sequence}";
    }

    public function createProposal(array $data, User $actor, ?UploadedFile $attachment = null): CareerTransition
    {
        $ownerId = $actor->accountOwnerId();
        $employee = Employee::query()
            ->with(['division', 'position', 'subCompany'])
            ->where('user_id', $ownerId)
            ->findOrFail($data['employee_id']);

        $effectiveDate = $data['effective_date'] ?? now()->toDateString();
        $type = $data['transition_type'] ?? CareerTransition::TYPE_MUTATION;
        $transitionNumber = $this->generateTransitionNumber($ownerId, $effectiveDate);
        $letterNumber = ! empty($data['letter_number'])
            ? $data['letter_number']
            : $this->generateSkNumber($ownerId, $effectiveDate, $type);

        $attachmentPath = null;
        $attachmentName = null;
        if ($attachment) {
            $attachmentPath = $attachment->store('career_transitions', 'public');
            $attachmentName = $attachment->getClientOriginalName();
        }

        $newDivisionName = ! empty($data['new_division_id'])
            ? Division::query()->where('user_id', $ownerId)->find($data['new_division_id'])?->name
            : null;

        $newPositionName = ! empty($data['new_position_id'])
            ? Position::query()->where('user_id', $ownerId)->find($data['new_position_id'])?->name
            : null;

        $newSubCompanyName = ! empty($data['new_sub_company_id'])
            ? SubCompany::query()->where('user_id', $ownerId)->find($data['new_sub_company_id'])?->name
            : null;

        $companySetting = CompanySetting::query()->where('user_id', $ownerId)->first();
        $companyName = $companySetting?->name ?? 'Perusahaan';

        $skTitle = match ($type) {
            CareerTransition::TYPE_PROMOTION => "SURAT KEPUTUSAN TENTANG PROMOSI JABATAN KARYAWAN",
            CareerTransition::TYPE_DEMOTION => "SURAT KEPUTUSAN TENTANG DEMOSI JABATAN KARYAWAN",
            CareerTransition::TYPE_MUTATION => "SURAT KEPUTUSAN TENTANG MUTASI TUGAS DAN PENEMPATAN KARYAWAN",
            CareerTransition::TYPE_ROTATION => "SURAT KEPUTUSAN TENTANG ROTASI JABATAN KARYAWAN",
            CareerTransition::TYPE_SALARY_ADJUSTMENT => "SURAT KEPUTUSAN TENTANG PENYESUAIAN GAJI DAN KOMPENSASI",
            default => "SURAT KEPUTUSAN PERUBAHAN STATUS DAN JABATAN KARYAWAN",
        };

        $skConsiderations = "a. Bahwa dalam rangka optimalisasi struktur organisasi dan pengembangan potensi sumber daya manusia di lingkungan {$companyName};\n"
            . "b. Bahwa Saudara/i {$employee->full_name} dipandang memenuhi kualifikasi dan kompetensi untuk mengemban amanah baru;\n"
            . "c. " . ($data['reason'] ?? 'Berdasarkan hasil evaluasi kinerja dan kebutuhan operasional perusahaan.');

        $skLegalBasis = "1. Peraturan Perusahaan dan Pedoman Tata Kelola Karyawan {$companyName};\n"
            . "2. Surat Permohonan dan Persetujuan Manajemen Terkait;\n"
            . "3. Hasil penilaian dan evaluasi kinerja karyawan.";

        $approvalLevels = isset($data['approval_levels']) ? (int) $data['approval_levels'] : 2;

        return CareerTransition::query()->create([
            'user_id' => $ownerId,
            'employee_id' => $employee->id,
            'transition_number' => $transitionNumber,
            'letter_number' => $letterNumber,
            'transition_type' => $type,
            'effective_date' => $effectiveDate,

            // Snapshot old data
            'old_division_id' => $employee->division_id,
            'old_division_name' => $employee->division?->name,
            'old_position_id' => $employee->position_id,
            'old_position_name' => $employee->position?->name,
            'old_sub_company_id' => $employee->sub_company_id,
            'old_sub_company_name' => $employee->subCompany?->name,
            'old_employment_status' => $employee->employment_status,
            'old_employment_type' => $employee->employment_type,
            'old_base_salary' => $employee->base_salary,
            'old_daily_wage' => $employee->daily_wage,

            // New proposed data
            'new_division_id' => $data['new_division_id'] ?? null,
            'new_division_name' => $newDivisionName,
            'new_position_id' => $data['new_position_id'] ?? null,
            'new_position_name' => $newPositionName,
            'new_sub_company_id' => $data['new_sub_company_id'] ?? null,
            'new_sub_company_name' => $newSubCompanyName,
            'new_employment_status' => $data['new_employment_status'] ?? null,
            'new_employment_type' => $data['new_employment_type'] ?? null,
            'new_base_salary' => isset($data['new_base_salary']) && $data['new_base_salary'] !== '' ? (float) $data['new_base_salary'] : null,
            'new_daily_wage' => isset($data['new_daily_wage']) && $data['new_daily_wage'] !== '' ? (float) $data['new_daily_wage'] : null,

            // Justification
            'reason' => $data['reason'],
            'notes' => $data['notes'] ?? null,
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,

            // Approval workflow
            'status' => CareerTransition::STATUS_PENDING,
            'approval_levels' => $approvalLevels,
            'approval_stage' => 0,
            'created_by_user_id' => $actor->id,

            // Default SK templates
            'sk_title' => $skTitle,
            'sk_signer_name' => $data['sk_signer_name'] ?? ($companySetting?->name ? 'Direksi ' . $companySetting->name : 'Pimpinan Perusahaan'),
            'sk_signer_position' => $data['sk_signer_position'] ?? 'Direktur / HR Management',
            'sk_considerations' => $skConsiderations,
            'sk_legal_basis' => $skLegalBasis,
            'sk_decision_points' => $data['sk_decision_points'] ?? null,
        ]);
    }

    public function approveLevel1(CareerTransition $transition, User $actor, ?string $notes = null): void
    {
        if ($transition->status !== CareerTransition::STATUS_PENDING || $transition->approval_stage !== 0) {
            throw ValidationException::withMessages([
                'approval' => 'Pengajuan ini tidak dalam tahap review Tingkat 1.',
            ]);
        }

        $updates = [
            'first_approver_id' => $actor->id,
            'first_approved_at' => now(),
            'first_approval_notes' => $notes,
        ];

        if ($transition->approval_levels === 1) {
            $updates['status'] = CareerTransition::STATUS_APPROVED;
            $updates['approval_stage'] = 2;
            $updates['sk_generated_at'] = now();
        } else {
            $updates['approval_stage'] = 1; // proceed to stage 2 (Level 2 approval)
        }

        $transition->update($updates);
    }

    public function approveLevel2(CareerTransition $transition, User $actor, ?string $notes = null, array $skOverrides = []): void
    {
        if ($transition->status !== CareerTransition::STATUS_PENDING || $transition->approval_stage !== 1) {
            throw ValidationException::withMessages([
                'approval' => 'Pengajuan ini tidak dalam tahap persetujuan Tingkat 2.',
            ]);
        }

        $updates = [
            'second_approver_id' => $actor->id,
            'second_approved_at' => now(),
            'second_approval_notes' => $notes,
            'status' => CareerTransition::STATUS_APPROVED,
            'approval_stage' => 2,
            'sk_generated_at' => now(),
        ];

        if (! empty($skOverrides['letter_number'])) {
            $updates['letter_number'] = $skOverrides['letter_number'];
        }
        if (! empty($skOverrides['sk_signer_name'])) {
            $updates['sk_signer_name'] = $skOverrides['sk_signer_name'];
        }
        if (! empty($skOverrides['sk_signer_position'])) {
            $updates['sk_signer_position'] = $skOverrides['sk_signer_position'];
        }

        $transition->update($updates);
    }

    public function reject(CareerTransition $transition, User $actor, string $reason): void
    {
        if ($transition->status !== CareerTransition::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'approval' => 'Pengajuan ini sudah tidak dapat ditolak.',
            ]);
        }

        $transition->update([
            'status' => CareerTransition::STATUS_REJECTED,
            'rejected_by_user_id' => $actor->id,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }

    public function applyToEmployee(CareerTransition $transition, User $actor): void
    {
        if ($transition->status !== CareerTransition::STATUS_APPROVED) {
            throw ValidationException::withMessages([
                'apply' => 'Hanya pengajuan dengan status Disetujui (Approved) yang dapat diterapkan ke master karyawan.',
            ]);
        }

        DB::transaction(function () use ($transition, $actor) {
            $employee = $transition->employee;
            if (! $employee) {
                throw ValidationException::withMessages([
                    'apply' => 'Data karyawan tidak ditemukan.',
                ]);
            }

            // Snapshot before applying
            $before = [
                'division_id' => $employee->division_id,
                'position_id' => $employee->position_id,
                'sub_company_id' => $employee->sub_company_id,
                'employment_status' => $employee->employment_status,
                'employment_type' => $employee->employment_type,
                'base_salary' => $employee->base_salary,
                'daily_wage' => $employee->daily_wage,
            ];

            // Build employee updates
            $employeeUpdates = [];
            if ($transition->new_division_id !== null) {
                $employeeUpdates['division_id'] = $transition->new_division_id;
            }
            if ($transition->new_position_id !== null) {
                $employeeUpdates['position_id'] = $transition->new_position_id;
            }
            if ($transition->new_sub_company_id !== null) {
                $employeeUpdates['sub_company_id'] = $transition->new_sub_company_id;
            }
            if (! empty($transition->new_employment_status)) {
                $employeeUpdates['employment_status'] = $transition->new_employment_status;
            }
            if (! empty($transition->new_employment_type)) {
                $employeeUpdates['employment_type'] = $transition->new_employment_type;
            }
            if ($transition->new_base_salary !== null) {
                $employeeUpdates['base_salary'] = $transition->new_base_salary;
            }
            if ($transition->new_daily_wage !== null) {
                $employeeUpdates['daily_wage'] = $transition->new_daily_wage;
            }

            if (! empty($employeeUpdates)) {
                $employee->update($employeeUpdates);
            }

            // Record changes in EmployeeEmploymentHistory
            $noteMessage = "Diterapkan melalui SK No: {$transition->letter_number} ({$transition->reason})";
            $this->historyService->recordChanges(
                $employee,
                $before,
                $transition->effective_date->toDateString(),
                $noteMessage,
                $actor
            );

            // Mark transition as applied
            $transition->update([
                'status' => CareerTransition::STATUS_APPLIED,
                'applied_at' => now(),
                'applied_by_user_id' => $actor->id,
            ]);
        });
    }

    public function generateSkPdf(CareerTransition $transition): Response
    {
        $ownerId = $transition->user_id;
        $companySetting = CompanySetting::query()->where('user_id', $ownerId)->first();
        $employee = $transition->employee?->loadMissing(['division', 'position', 'subCompany']);

        $filename = sprintf(
            'SK_%s_%s.pdf',
            preg_replace('/[^A-Za-z0-9_-]/', '_', (string) $transition->letter_number),
            $employee?->employee_code ?: 'karyawan'
        );

        return Pdf::loadView('hris.career_transitions.sk_pdf', [
            'transition' => $transition,
            'employee' => $employee,
            'companySetting' => $companySetting,
            'documentTitle' => $transition->sk_title ?: 'SURAT KEPUTUSAN RESMI',
        ])
        ->setPaper('a4', 'portrait')
        ->download($filename);
    }

    public function previewSkPdf(CareerTransition $transition): Response
    {
        $ownerId = $transition->user_id;
        $companySetting = CompanySetting::query()->where('user_id', $ownerId)->first();
        $employee = $transition->employee?->loadMissing(['division', 'position', 'subCompany']);

        $filename = sprintf(
            'SK_%s_%s.pdf',
            preg_replace('/[^A-Za-z0-9_-]/', '_', (string) $transition->letter_number),
            $employee?->employee_code ?: 'karyawan'
        );

        return Pdf::loadView('hris.career_transitions.sk_pdf', [
            'transition' => $transition,
            'employee' => $employee,
            'companySetting' => $companySetting,
            'documentTitle' => $transition->sk_title ?: 'SURAT KEPUTUSAN RESMI',
        ])
        ->setPaper('a4', 'portrait')
        ->stream($filename);
    }

    private function romanMonth(int $month): string
    {
        $map = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
        ];

        return $map[$month] ?? 'I';
    }
}
