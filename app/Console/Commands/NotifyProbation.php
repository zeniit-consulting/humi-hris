<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Services\WhatsAppNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class NotifyProbation extends Command
{
    protected $signature = 'employee:notify-probation {--days=90 : Jumlah hari masa percobaan}';

    protected $description = 'Kirim notifikasi WhatsApp kepada karyawan probation yang masa percobaannya akan berakhir';

    public function handle(WhatsAppNotificationService $notificationService): int
    {
        $probationDays = max(1, (int) $this->option('days'));
        $today = Carbon::today();
        $threshold = $today->copy()->subDays($probationDays - 14);

        $employees = Employee::query()
            ->withoutGlobalScopes()
            ->where('is_active', true)
            ->where('employment_status', 'probation')
            ->whereNotNull('hire_date')
            ->where('hire_date', '<=', $threshold->toDateString())
            ->get();

        if ($employees->isEmpty()) {
            $this->info('Tidak ada karyawan probation yang mendekati akhir masa percobaan.');

            return self::SUCCESS;
        }

        $sent = 0;
        $skipped = 0;

        foreach ($employees as $employee) {
            $daysSinceHire = (int) Carbon::parse($employee->hire_date)->diffInDays($today);

            try {
                $notificationService->notifyProbation($employee, $daysSinceHire);
                $sent++;
                $this->line("Notifikasi terkirim: {$employee->full_name} ({$daysSinceHire} hari)");
            } catch (\Throwable $e) {
                $skipped++;
                $this->warn("Gagal mengirim ke {$employee->full_name}: {$e->getMessage()}");
            }
        }

        $this->info("Selesai. Terkirim: {$sent}, Gagal: {$skipped}.");

        return self::SUCCESS;
    }
}
