<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeSchedule;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AutoMarkAbsent extends Command
{
    protected $signature = 'attendance:auto-absent
                            {--date= : Tanggal dalam format YYYY-MM-DD (default: kemarin)}';

    protected $description = 'Otomatis tandai karyawan yang memiliki jadwal kerja tapi tidak ada record absensi sebagai absen';

    public function handle(): int
    {
        $date = $this->option('date')
            ? Carbon::parse((string) $this->option('date'))->toDateString()
            : Carbon::yesterday()->toDateString();

        $schedules = EmployeeSchedule::query()
            ->withoutGlobalScopes()
            ->where('work_date', $date)
            ->where('is_day_off', false)
            ->get();

        if ($schedules->isEmpty()) {
            $this->info("Tidak ada jadwal kerja aktif untuk tanggal {$date}.");

            return self::SUCCESS;
        }

        $existingAttendances = EmployeeAttendance::query()
            ->withoutGlobalScopes()
            ->where('attendance_date', $date)
            ->pluck('employee_id')
            ->all();

        $missing = $schedules->reject(fn ($schedule) => in_array($schedule->employee_id, $existingAttendances));

        if ($missing->isEmpty()) {
            $this->info("Semua karyawan dengan jadwal kerja tanggal {$date} sudah memiliki record absensi.");

            return self::SUCCESS;
        }

        $activeEmployeeIds = Employee::query()
            ->withoutGlobalScopes()
            ->where('is_active', true)
            ->whereIn('employment_status', ['active', 'probation', 'on_leave'])
            ->pluck('id')
            ->all();

        $toCreate = $missing->filter(fn ($schedule) => in_array($schedule->employee_id, $activeEmployeeIds));

        if ($toCreate->isEmpty()) {
            $this->info("Tidak ada karyawan aktif yang perlu ditandai absen untuk tanggal {$date}.");

            return self::SUCCESS;
        }

        $rows = $toCreate->map(fn ($schedule) => [
            'user_id' => $schedule->user_id,
            'employee_id' => $schedule->employee_id,
            'shift_id' => null,
            'attendance_date' => $date,
            'status' => 'absent',
            'check_in_at' => null,
            'check_out_at' => null,
            'notes' => 'Otomatis ditandai absen (tidak ada record absensi)',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::transaction(function () use ($rows): void {
            foreach ($rows as $row) {
                EmployeeAttendance::query()->withoutGlobalScopes()->create($row);
            }
        });

        $this->info(sprintf(
            'Selesai. %d karyawan ditandai absen untuk tanggal %s.',
            $rows->count(),
            $date,
        ));

        return self::SUCCESS;
    }
}
