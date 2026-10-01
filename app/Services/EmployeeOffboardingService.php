<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeEmploymentHistory;
use App\Models\User;
use App\Support\WhatsAppPhone;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EmployeeOffboardingService
{
    /**
     * Schedule or execute offboarding depending on whether offboarded_at is in the future or not.
     *
     * @param  array{offboarded_at: string, offboarding_reason: string, offboarding_notes?: ?string}  $data
     * @return array{status: 'scheduled'|'completed', message: string}
     */
    public function scheduleOrExecuteOffboard(Employee $employee, array $data, ?User $actor = null): array
    {
        $offboardDate = Carbon::parse($data['offboarded_at'])->startOfDay();
        $isFuture = $offboardDate->isFuture();

        DB::transaction(function () use ($employee, $data, $actor, $isFuture): void {
            $before = $employee->only(['employment_status', 'division_id', 'position_id']);

            if ($isFuture) {
                $employee->forceFill([
                    'is_active' => true,
                    'offboarded_at' => $data['offboarded_at'],
                    'offboarding_reason' => $data['offboarding_reason'],
                    'offboarding_notes' => $data['offboarding_notes'] ?? null,
                ])->save();

                EmployeeEmploymentHistory::create([
                    'user_id' => $employee->user_id,
                    'employee_id' => $employee->id,
                    'created_by_user_id' => $actor?->id,
                    'event_type' => 'offboarding_scheduled',
                    'effective_date' => $data['offboarded_at'],
                    'old_status' => $employee->employment_status,
                    'new_status' => $employee->employment_status,
                    'notes' => 'Jadwal Offboarding ('.$this->offboardingReasonLabel($data['offboarding_reason']).')'.(isset($data['offboarding_notes']) && $data['offboarding_notes'] !== '' ? ': '.$data['offboarding_notes'] : ''),
                ]);
            } else {
                $employee->forceFill([
                    'employment_status' => 'resigned',
                    'is_active' => false,
                    'offboarded_at' => $data['offboarded_at'],
                    'offboarding_reason' => $data['offboarding_reason'],
                    'offboarding_notes' => $data['offboarding_notes'] ?? null,
                ])->save();

                EmployeeEmploymentHistory::create([
                    'user_id' => $employee->user_id,
                    'employee_id' => $employee->id,
                    'created_by_user_id' => $actor?->id,
                    'event_type' => 'status_change',
                    'effective_date' => $data['offboarded_at'],
                    'old_status' => $before['employment_status'] ?? null,
                    'new_status' => 'resigned',
                    'notes' => $data['offboarding_notes'] ?? $this->offboardingReasonLabel($data['offboarding_reason']),
                ]);

                $this->finalizeOffboardingEffects($employee, $actor, $data['offboarding_reason']);
            }
        });

        if ($isFuture) {
            return [
                'status' => 'scheduled',
                'message' => "Offboarding karyawan berhasil dijadwalkan pada {$data['offboarded_at']}. Karyawan tetap aktif sampai tanggal tersebut.",
            ];
        }

        return [
            'status' => 'completed',
            'message' => 'Offboarding karyawan berhasil diproses.',
        ];
    }

    /**
     * Cancel a scheduled offboarding for an employee.
     */
    public function cancelOffboard(Employee $employee, ?User $actor = null): void
    {
        DB::transaction(function () use ($employee, $actor): void {
            $oldOffboardDate = $employee->offboarded_at?->format('Y-m-d') ?? 'terjadwal';

            $employee->forceFill([
                'offboarded_at' => null,
                'offboarding_reason' => null,
                'offboarding_notes' => null,
                'is_active' => true,
            ])->save();

            EmployeeEmploymentHistory::create([
                'user_id' => $employee->user_id,
                'employee_id' => $employee->id,
                'created_by_user_id' => $actor?->id,
                'event_type' => 'offboarding_cancelled',
                'effective_date' => today()->toDateString(),
                'old_status' => $employee->employment_status,
                'new_status' => $employee->employment_status,
                'notes' => "Pembatalan jadwal offboarding (sebelumnya dijadwalkan {$oldOffboardDate})",
            ]);
        });
    }

    /**
     * Process employees whose scheduled offboarding date has arrived (offboarded_at <= today()).
     * Transitions them to resigned status, deactivates active flag, unassigns reports, and suspends portal.
     */
    public function processMaturedOffboardings(?int $ownerId = null): int
    {
        $query = Employee::query()
            ->where('is_active', true)
            ->whereNotNull('offboarded_at')
            ->whereDate('offboarded_at', '<=', today());

        if ($ownerId !== null) {
            $query->where('user_id', $ownerId);
        }

        $maturedEmployees = $query->get();
        $processedCount = 0;

        foreach ($maturedEmployees as $employee) {
            DB::transaction(function () use ($employee): void {
                $oldStatus = $employee->employment_status;

                $employee->forceFill([
                    'employment_status' => 'resigned',
                    'is_active' => false,
                ])->save();

                EmployeeEmploymentHistory::create([
                    'user_id' => $employee->user_id,
                    'employee_id' => $employee->id,
                    'created_by_user_id' => null,
                    'event_type' => 'status_change',
                    'effective_date' => $employee->offboarded_at?->toDateString() ?? today()->toDateString(),
                    'old_status' => $oldStatus,
                    'new_status' => 'resigned',
                    'notes' => 'Offboarding efektif sesuai jadwal: '.$this->offboardingReasonLabel($employee->offboarding_reason ?? 'other'),
                ]);

                $this->finalizeOffboardingEffects($employee, null, $employee->offboarding_reason);
            });

            $processedCount++;
        }

        return $processedCount;
    }

    /**
     * Finalize offboarding effects: unassign direct reports and suspend portal user accounts.
     */
    public function finalizeOffboardingEffects(Employee $employee, ?User $actor = null, ?string $reason = null): void
    {
        $employee->directReports()->update(['manager_id' => null]);

        $portalUsers = User::query()
            ->where(function ($query) use ($employee): void {
                if ($employee->phone) {
                    $normalized = WhatsAppPhone::normalize($employee->phone);
                    $query->where('phone', $employee->phone)
                        ->orWhere('phone', $normalized);
                }
                if ($employee->email) {
                    $query->orWhere('email', $employee->email);
                }
            })
            ->where(function ($query) use ($employee): void {
                $query->where('id', $employee->user_id)
                    ->orWhere('parent_user_id', $employee->user_id);
            })
            ->get(['id']);

        $portalUserIds = $portalUsers->modelKeys();

        if ($portalUserIds !== []) {
            User::query()
                ->whereKey($portalUserIds)
                ->update([
                    'suspended_at' => now(),
                    'suspension_reason' => 'Employee offboarding: '.$this->offboardingReasonLabel($reason ?? $employee->offboarding_reason ?? 'other'),
                    'suspended_by' => $actor?->id,
                    'remember_token' => null,
                ]);

            DB::table('sessions')
                ->whereIn('user_id', $portalUserIds)
                ->delete();

            foreach ($portalUsers as $portalUser) {
                $portalUser->tokens()->delete();
            }
        }
    }

    /**
     * Human-readable label for offboarding reasons.
     */
    public function offboardingReasonLabel(string $reason): string
    {
        return match ($reason) {
            'terminated' => 'Diberhentikan',
            'contract_ended' => 'Kontrak berakhir',
            'retired' => 'Pensiun',
            'other' => 'Lainnya',
            default => 'Mengundurkan diri',
        };
    }
}
