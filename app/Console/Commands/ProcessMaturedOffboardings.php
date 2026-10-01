<?php

namespace App\Console\Commands;

use App\Services\EmployeeOffboardingService;
use Illuminate\Console\Command;

class ProcessMaturedOffboardings extends Command
{
    protected $signature = 'employee:process-offboarding';

    protected $description = 'Otomatis proses offboarding karyawan yang telah mencapai tanggal offboarding terjadwal';

    public function handle(EmployeeOffboardingService $offboardingService): int
    {
        $processed = $offboardingService->processMaturedOffboardings();

        if ($processed === 0) {
            $this->info('Tidak ada karyawan yang jatuh tempo offboarding hari ini.');

            return self::SUCCESS;
        }

        $this->info("Selesai. {$processed} karyawan berhasil diproses offboarding.");

        return self::SUCCESS;
    }
}
