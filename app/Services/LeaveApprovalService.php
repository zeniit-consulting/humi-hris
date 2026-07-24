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

    public function __construct(private readonly LeaveBalanceService $balanceService, private readonly ApprovalWorkflowService $workflow) {}

    public function approve(LeaveRequest $leave, User $approver): string
    {
        $result = $this->workflow->approve($leave, $approver);
        if ($result === ApprovalWorkflowService::ADVANCED) return self::FIRST_LEVEL;

        DB::transaction(function () use ($leave, $approver): void {
            if ($leave->leave_type === 'annual' && ! $this->balanceService->deductBalance($leave)) {
                throw ValidationException::withMessages(['balance' => 'Saldo cuti tidak mencukupi.']);
            }

            $leave->update([
                'status' => 'approved',
                'approval_stage' => $leave->approval_levels,
                'approved_at' => now(),
                'approved_by' => $approver->id,
                'rejection_reason' => null,
            ]);
        });

        return self::FINAL_APPROVAL;
    }
}
