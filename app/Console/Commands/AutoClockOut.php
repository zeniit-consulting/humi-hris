<?php

namespace App\Console\Commands;

use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class AutoClockOut extends Command
{
    protected $signature = 'attendance:auto-clock-out';

    protected $description = 'Otomatis isi jam pulang karyawan yang lupa absen pulang berdasarkan jadwal shift hari ini';

    public function handle(): int
    {
        $today = Carbon::today()->toDateString();

        $attendances = EmployeeAttendance::query()
            ->withoutGlobalScopes()
            ->where('attendance_date', $today)
            ->whereNotNull('check_in_at')
            ->whereNull('check_out_at')
            ->get();

        if ($attendances->isEmpty()) {
            $this->info('Tidak ada absensi hari ini yang belum clock out.');

            return self::SUCCESS;
        }

        $updated = 0;
        $skipped = 0;

        foreach ($attendances as $attendance) {
            $schedule = EmployeeSchedule::query()
                ->withoutGlobalScopes()
                ->where('employee_id', $attendance->employee_id)
                ->where('work_date', $today)
                ->where('is_day_off', false)
                ->first();

            $endTime = $schedule?->end_time ?? '22:00:00';

            if (is_string($endTime) && strlen($endTime) <= 5) {
                $endTime .= ':00';
            }

            try {
                $checkOutAt = Carbon::parse($today.' '.$endTime);

                $attendance->update([
                    'check_out_at' => $checkOutAt,
                    'notes' => ($attendance->notes ? $attendance->notes."\n" : '').'Lupa Absen Pulang',
                ]);

                $updated++;
                $this->line("Clock out otomatis: {$attendance->employee->full_name} pukul {$checkOutAt->format('H:i')}");
            } catch (\Throwable $e) {
                $skipped++;
                $this->warn("Gagal clock out karyawan #{$attendance->employee_id}: {$e->getMessage()}");
            }
        }

        $this->info("Selesai. Clock out otomatis: {$updated}, Gagal: {$skipped}.");

        return self::SUCCESS;
    }
}
