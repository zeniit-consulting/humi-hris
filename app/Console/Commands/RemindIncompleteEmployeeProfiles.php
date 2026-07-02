<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\NotificationAnnouncement;
use App\Services\EmployeeProfileCompletionService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class RemindIncompleteEmployeeProfiles extends Command
{
    protected $signature = 'employee:remind-incomplete-profile';

    protected $description = 'Buat reminder portal untuk karyawan yang profil self-service-nya belum lengkap.';

    public function handle(EmployeeProfileCompletionService $completionService): int
    {
        $today = Carbon::today();
        $employeesByOwner = Employee::query()
            ->withoutGlobalScopes()
            ->with('bankAccounts')
            ->where('is_active', true)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->groupBy('user_id');

        $created = 0;

        foreach ($employeesByOwner as $ownerId => $employees) {
            $incomplete = $employees
                ->filter(fn (Employee $employee): bool => ! $completionService->summarize($employee)['is_complete'])
                ->values();

            if ($incomplete->isEmpty()) {
                continue;
            }

            if ($this->alreadyPublishedToday((int) $ownerId, $today)) {
                $this->line("Owner #{$ownerId}: reminder kelengkapan profil hari ini sudah ada, dilewati.");

                continue;
            }

            $names = $incomplete
                ->take(5)
                ->map(fn (Employee $employee): string => $employee->full_name)
                ->implode(', ');

            NotificationAnnouncement::query()->create([
                'user_id' => (int) $ownerId,
                'title' => 'Reminder Kelengkapan Profil Karyawan',
                'message' => $incomplete->count().' karyawan masih perlu melengkapi profil. Contoh: '.$names.'. Minta karyawan membuka menu Profil di portal.',
                'audience' => 'active_employees',
                'channel' => 'portal',
                'status' => 'published',
                'publish_at' => now(),
                'expires_at' => now()->addDays(3),
            ]);

            $created++;
            $this->line("Owner #{$ownerId}: reminder kelengkapan profil dibuat ({$incomplete->count()} karyawan).");
        }

        if ($created === 0) {
            $this->info('Tidak ada reminder kelengkapan profil baru.');
        }

        return self::SUCCESS;
    }

    private function alreadyPublishedToday(int $ownerId, Carbon $today): bool
    {
        return NotificationAnnouncement::query()
            ->where('user_id', $ownerId)
            ->where('title', 'Reminder Kelengkapan Profil Karyawan')
            ->whereDate('publish_at', $today->toDateString())
            ->exists();
    }
}
