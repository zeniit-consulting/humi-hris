<?php

use App\Models\PayrollRun;
use App\Services\PayrollGenerationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('payroll:recalculate {runId? : Payroll run ID} {--period= : Payroll period in YYYY-MM format} {--owner= : Account owner user ID} {--draft : Mark recalculated payroll as draft/unsaved}', function (PayrollGenerationService $payrolls): int {
    $runId = $this->argument('runId');
    $period = $this->option('period');
    $ownerId = $this->option('owner') ? (int) $this->option('owner') : null;
    $markAsDraft = (bool) $this->option('draft');

    if ($runId) {
        $run = PayrollRun::query()
            ->withoutGlobalScopes()
            ->find($runId);

        if (! $run) {
            $this->error("Payroll run #{$runId} tidak ditemukan.");

            return self::FAILURE;
        }

        $updated = $payrolls->recalculateRun($run, null, $markAsDraft);

        $this->info(sprintf(
            'Payroll run #%d periode %s berhasil dihitung ulang: %d karyawan, total net %s.',
            $updated->id,
            $updated->period,
            $updated->employees_count,
            number_format((float) $updated->total_net_salary, 2, '.', ','),
        ));

        return self::SUCCESS;
    }

    if (! $period || ! preg_match('/^\d{4}-\d{2}$/', (string) $period)) {
        $this->error('Isi runId atau option --period=YYYY-MM.');

        return self::FAILURE;
    }

    $runs = PayrollRun::query()
        ->withoutGlobalScopes()
        ->where('period', $period)
        ->when($ownerId, fn ($query) => $query->where('user_id', $ownerId))
        ->orderBy('id')
        ->get();

    if ($runs->isEmpty()) {
        if (! $ownerId) {
            $this->error("Tidak ada payroll run periode {$period}. Isi --owner=USER_ID untuk membuat/generate run baru.");

            return self::FAILURE;
        }

        $updated = $payrolls->generateForPeriod($ownerId, (string) $period, null, ! $markAsDraft ? false : true);

        $this->info(sprintf(
            'Payroll run #%d periode %s berhasil dibuat: %d karyawan, total net %s.',
            $updated->id,
            $updated->period,
            $updated->employees_count,
            number_format((float) $updated->total_net_salary, 2, '.', ','),
        ));

        return self::SUCCESS;
    }

    foreach ($runs as $run) {
        $updated = $payrolls->recalculateRun($run, null, $markAsDraft);

        $this->line(sprintf(
            '#%d owner %d periode %s: %d karyawan, total net %s',
            $updated->id,
            $updated->user_id,
            $updated->period,
            $updated->employees_count,
            number_format((float) $updated->total_net_salary, 2, '.', ','),
        ));
    }

    $this->info('Recalculate payroll selesai.');

    return self::SUCCESS;
})->purpose('Recalculate saved payroll items and totals using current payroll tax rules');

Schedule::command('leave:accrue-monthly')->monthlyOn(1, '00:00');
Schedule::command('employee:notify-contract-expiry')->dailyAt('08:00');
Schedule::command('subscription:notify-renewal-reminder --days=7')->dailyAt('09:00');
Schedule::command('employee:notify-birthday')->dailyAt('08:00');
Schedule::command('employee:notify-probation --days=90')->dailyAt('08:30');
Schedule::command('approval:remind-pending --hours=24')->dailyAt('09:15');
Schedule::command('employee:remind-incomplete-profile')->dailyAt('09:30');
Schedule::command('kasbon:remind-balance')->twiceMonthly(1, 15, '09:00');
Schedule::command('attendance:auto-clock-out')->dailyAt('22:00');

// Automation: expire subscriptions past their active period
Schedule::command('subscription:expire')->dailyAt('00:30');

// Automation: auto-generate draft payroll on the 1st of each month
Schedule::command('payroll:auto-generate')->monthlyOn(1, '01:00');

// Automation: mark absent employees who had a work schedule but no attendance record
Schedule::command('attendance:auto-absent')->dailyAt('23:00');
