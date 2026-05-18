<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Services\WhatsAppNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class NotifyContractExpiry extends Command
{
    protected $signature = 'employee:notify-contract-expiry';

    protected $description = 'Kirim notifikasi WhatsApp kepada karyawan kontrak yang kontraknya akan berakhir dalam 30 hari';

    public function handle(WhatsAppNotificationService $notificationService): int
    {
        // Cek apakah kolom contract_end_date tersedia di tabel employees
        if (! \Illuminate\Support\Facades\Schema::hasColumn('employees', 'contract_end_date')) {
            $this->warn('Fitur ini membutuhkan kolom contract_end_date di tabel employees. Silakan buat migration terlebih dahulu.');

            return self::SUCCESS;
        }

        $today = Carbon::today();
        $threshold = $today->copy()->addDays(30);

        $employees = Employee::query()
            ->withoutGlobalScopes()
            ->where('is_active', true)
            ->where('employment_type', 'PKWT')
            ->whereNotNull('contract_end_date')
            ->whereBetween('contract_end_date', [$today->toDateString(), $threshold->toDateString()])
            ->get();

        if ($employees->isEmpty()) {
            $this->info('Tidak ada karyawan kontrak yang akan berakhir dalam 30 hari.');

            return self::SUCCESS;
        }

        $sent = 0;
        $skipped = 0;

        foreach ($employees as $employee) {
            $daysLeft = (int) Carbon::parse($employee->contract_end_date)->diffInDays($today);

            try {
                $notificationService->notifyContractExpiry($employee, $daysLeft);
                $sent++;
                $this->line("Notifikasi terkirim: {$employee->full_name} (sisa {$daysLeft} hari)");
            } catch (\Throwable $e) {
                $skipped++;
                $this->warn("Gagal mengirim ke {$employee->full_name}: {$e->getMessage()}");
            }
        }

        $this->info("Selesai. Terkirim: {$sent}, Gagal: {$skipped}.");

        return self::SUCCESS;
    }
}
