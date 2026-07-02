<?php

namespace App\Console\Commands;

use App\Models\PayrollRun;
use App\Models\User;
use App\Services\PayrollGenerationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class AutoGeneratePayroll extends Command
{
    protected $signature = 'payroll:auto-generate
                            {--period= : Periode payroll dalam format YYYY-MM (default: bulan berjalan)}
                            {--owner= : Account owner user ID (default: semua owner)}';

    protected $description = 'Otomatis generate draft payroll bulanan untuk semua owner yang belum memiliki payroll run di periode tersebut';

    public function handle(PayrollGenerationService $payrolls): int
    {
        $period = $this->option('period')
            ? (string) $this->option('period')
            : Carbon::today()->format('Y-m');

        if (! preg_match('/^\d{4}-\d{2}$/', $period)) {
            $this->error('Format periode tidak valid. Gunakan YYYY-MM.');

            return self::FAILURE;
        }

        $ownerId = $this->option('owner') ? (int) $this->option('owner') : null;

        $owners = User::query()
            ->whereNull('parent_user_id')
            ->when($ownerId, fn ($query) => $query->where('id', $ownerId))
            ->orderBy('id')
            ->get();

        if ($owners->isEmpty()) {
            $this->error('Tidak ditemukan account owner.');

            return self::FAILURE;
        }

        $generated = 0;
        $skipped = 0;

        foreach ($owners as $owner) {
            $exists = PayrollRun::query()
                ->withoutGlobalScopes()
                ->where('user_id', $owner->id)
                ->where('period', $period)
                ->where('type', 'regular')
                ->exists();

            if ($exists) {
                $skipped++;
                $this->line("Owner #{$owner->id}: payroll periode {$period} sudah ada, dilewati.");

                continue;
            }

            try {
                $run = $payrolls->generateForPeriod($owner->id, $period, null, true);

                $generated++;
                $this->line(sprintf(
                    'Owner #%d: payroll run #%d periode %s dibuat (draft) — %d karyawan, total net %s',
                    $owner->id,
                    $run->id,
                    $run->period,
                    $run->employees_count,
                    number_format((float) $run->total_net_salary, 2, '.', ','),
                ));
            } catch (\Throwable $e) {
                $skipped++;
                $this->warn("Owner #{$owner->id}: gagal generate payroll — {$e->getMessage()}");
            }
        }

        $this->info("Selesai. Generate: {$generated}, Dilewati/Gagal: {$skipped}.");

        return self::SUCCESS;
    }
}
