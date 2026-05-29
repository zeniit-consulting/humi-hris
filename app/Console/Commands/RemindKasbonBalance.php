<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\EmployeeDeduction;
use App\Services\WhatsAppNotificationService;
use Illuminate\Console\Command;

class RemindKasbonBalance extends Command
{
    protected $signature = 'kasbon:remind-balance';

    protected $description = 'Kirim pengingat saldo kasbon via WhatsApp kepada karyawan yang masih memiliki kasbon';

    public function handle(WhatsAppNotificationService $notificationService): int
    {
        $employeeIds = EmployeeDeduction::query()
            ->where('type', 'kasbon')
            ->distinct()
            ->pluck('employee_id');

        if ($employeeIds->isEmpty()) {
            $this->info('Tidak ada karyawan dengan kasbon aktif.');

            return self::SUCCESS;
        }

        $employees = Employee::query()
            ->withoutGlobalScopes()
            ->whereIn('id', $employeeIds)
            ->where('is_active', true)
            ->get();

        if ($employees->isEmpty()) {
            $this->info('Tidak ada karyawan aktif dengan kasbon.');

            return self::SUCCESS;
        }

        $sent = 0;
        $skipped = 0;

        foreach ($employees as $employee) {
            $totalKasbon = (float) EmployeeDeduction::query()
                ->where('employee_id', $employee->id)
                ->where('type', 'kasbon')
                ->sum('amount');

            if ($totalKasbon <= 0) {
                continue;
            }

            try {
                $notificationService->notifyKasbonReminder($employee, $totalKasbon);
                $sent++;
                $this->line("Reminder terkirim: {$employee->full_name} (Rp ".number_format($totalKasbon, 0, ',', '.').")");
            } catch (\Throwable $e) {
                $skipped++;
                $this->warn("Gagal mengirim ke {$employee->full_name}: {$e->getMessage()}");
            }
        }

        $this->info("Selesai. Terkirim: {$sent}, Gagal: {$skipped}.");

        return self::SUCCESS;
    }
}
