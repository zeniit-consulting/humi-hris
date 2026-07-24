<?php

namespace App\Console\Commands;

use App\Models\EmployeeAttendance;
use App\Services\MissingCheckoutLeaveSyncService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class AutoClockOut extends Command
{
    protected $signature = 'attendance:auto-clock-out';

    protected $description = 'Otomatis isi jam pulang karyawan yang lupa absen pulang berdasarkan jadwal shift hari ini';

    public function handle(MissingCheckoutLeaveSyncService $syncService): int
    {
        $today = Carbon::today()->toDateString();

        $ownerIds = EmployeeAttendance::query()
            ->withoutGlobalScopes()
            ->where('attendance_date', $today)
            ->whereNotNull('check_in_at')
            ->whereNull('check_out_at')
            ->distinct()
            ->pluck('user_id');

        if ($ownerIds->isEmpty()) {
            $this->info('Tidak ada absensi hari ini yang belum clock out.');

            return self::SUCCESS;
        }

        $updated = 0;
        $deducted = 0;
        $skipped = 0;
        foreach ($ownerIds as $ownerId) {
            $result = $syncService->sync((int) $ownerId, $today);
            $updated += $result['clocked_out'];
            $deducted += $result['leave_deducted'];
            $skipped += $result['skipped'];
        }

        $this->info("Selesai. Clock out otomatis: {$updated}, Potong cuti: {$deducted}, Gagal: {$skipped}.");

        return self::SUCCESS;
    }
}
