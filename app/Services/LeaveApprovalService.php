<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LeaveApprovalService
{
    public const FIRST_LEVEL = 'first_level';

    public const FINAL_APPROVAL = 'final_approval';

    public function __construct(private readonly LeaveBalanceService $balanceService) {}

    public function approve(LeaveRequest $leave, User $approver): string
    {
        if ($leave->status !== 'pending') {
            throw ValidationException::withMessages(['approval' => 'Request cuti sudah diproses.']);
        }

        $owner = User::findOrFail($leave->user_id);
        $policy = $this->balanceService->getPolicy($owner, 'annual');
        $approvalLevels = (int) ($policy?->approval_levels ?? 1);

        if ($approvalLevels === 2 && $leave->approval_stage < 1) {
            $leave->update([
                'approval_stage' => 1,
                'first_approved_by' => $approver->id,
                'first_approved_at' => now(),
                'rejection_reason' => null,
            ]);

            return self::FIRST_LEVEL;
        }

        if ($approvalLevels === 2 && (int) $leave->first_approved_by === $approver->id) {
            throw ValidationException::withMessages([
                'approval' => 'Approval tingkat 2 harus dilakukan oleh pengguna yang berbeda.',
            ]);
        }

        DB::transaction(function () use ($leave, $approver, $approvalLevels): void {
            if ($leave->leave_type === 'annual' && ! $this->balanceService->deductBalance($leave)) {
                throw ValidationException::withMessages(['balance' => 'Saldo cuti tidak mencukupi.']);
            }

            $leave->update([
                'status' => 'approved',
                'approval_stage' => $approvalLevels,
                'approved_at' => now(),
                'approved_by' => $approver->id,
                'rejection_reason' => null,
            ]);
        });

        return self::FINAL_APPROVAL;
    }
}
