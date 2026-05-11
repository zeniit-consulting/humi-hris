<?php

namespace App\Console\Commands;

use App\Models\LeavePolicy;
use App\Models\User;
use App\Services\LeaveBalanceService;
use Illuminate\Console\Command;

class AccrueLeaveMonthly extends Command
{
    protected $signature = 'leave:accrue-monthly';

    protected $description = 'Jalankan akrual cuti bulanan untuk semua karyawan dengan policy accrual';

    public function handle(LeaveBalanceService $balanceService): int
    {
        // Get all unique user_ids that have accrual policies
        $ownerIds = LeavePolicy::withoutGlobalScopes()
            ->where('policy_type', 'accrual')
            ->where('is_active', true)
            ->distinct()
            ->pluck('user_id');

        if ($ownerIds->isEmpty()) {
            $this->info('Tidak ada policy accrual aktif yang ditemukan.');

            return self::SUCCESS;
        }

        foreach ($ownerIds as $ownerId) {
            $owner = User::find($ownerId);

            if (! $owner) {
                continue;
            }

            // Get all accrual leave types for this owner
            $leaveTypes = LeavePolicy::withoutGlobalScopes()
                ->where('user_id', $ownerId)
                ->where('policy_type', 'accrual')
                ->where('is_active', true)
                ->pluck('leave_type');

            foreach ($leaveTypes as $leaveType) {
                $count = $balanceService->accrueMonthly($owner, $leaveType);
                $this->info("Owner #{$ownerId}: {$count} karyawan di-accrue untuk leave_type '{$leaveType}'.");
            }
        }

        $this->info('Akrual cuti bulanan selesai.');

        return self::SUCCESS;
    }
}
