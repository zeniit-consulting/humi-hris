<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Services\WhatsAppNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class NotifyBirthday extends Command
{
    protected $signature = 'employee:notify-birthday';

    protected $description = 'Kirim ucapan ulang tahun via WhatsApp kepada karyawan yang berulang tahun hari ini';

    public function handle(WhatsAppNotificationService $notificationService): int
    {
        $today = Carbon::today();

        $employees = Employee::query()
            ->withoutGlobalScopes()
            ->where('is_active', true)
            ->whereNotNull('birth_date')
            ->whereMonth('birth_date', $today->month)
            ->whereDay('birth_date', $today->day)
            ->get();

        if ($employees->isEmpty()) {
            $this->info('Tidak ada karyawan yang berulang tahun hari ini.');

            return self::SUCCESS;
        }

        $sent = 0;
        $skipped = 0;

        foreach ($employees as $employee) {
            try {
                $notificationService->notifyBirthday($employee);
                $sent++;
                $this->line("Ucapan terkirim: {$employee->full_name}");
            } catch (\Throwable $e) {
                $skipped++;
                $this->warn("Gagal mengirim ke {$employee->full_name}: {$e->getMessage()}");
            }
        }

        $this->info("Selesai. Terkirim: {$sent}, Gagal: {$skipped}.");

        return self::SUCCESS;
    }
}
