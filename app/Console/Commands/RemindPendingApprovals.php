<?php

namespace App\Console\Commands;

use App\Models\AttendanceCorrectionRequest;
use App\Models\LeaveRequest;
use App\Models\NotificationAnnouncement;
use App\Models\OvertimeRequest;
use App\Models\ShiftChangeRequest;
use Carbon\CarbonInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class RemindPendingApprovals extends Command
{
    protected $signature = 'approval:remind-pending {--hours=24 : Minimum pending age in hours}';

    protected $description = 'Buat reminder portal untuk approval yang masih pending melewati batas waktu.';

    public function handle(): int
    {
        $hours = max((int) $this->option('hours'), 1);
        $cutoff = now()->subHours($hours);
        $today = Carbon::today();

        $ownerIds = collect([
            ...$this->ownerIds(AttendanceCorrectionRequest::class, $cutoff),
            ...$this->ownerIds(LeaveRequest::class, $cutoff),
            ...$this->ownerIds(OvertimeRequest::class, $cutoff),
            ...$this->ownerIds(ShiftChangeRequest::class, $cutoff),
        ])->unique()->values();

        if ($ownerIds->isEmpty()) {
            $this->info('Tidak ada approval pending yang perlu diingatkan.');

            return self::SUCCESS;
        }

        foreach ($ownerIds as $ownerId) {
            if ($this->alreadyPublishedToday((int) $ownerId, 'Reminder Approval Pending', $today)) {
                $this->line("Owner #{$ownerId}: reminder approval pending hari ini sudah ada, dilewati.");

                continue;
            }

            $counts = [
                'Absensi' => $this->pendingCount(AttendanceCorrectionRequest::class, (int) $ownerId, $cutoff),
                'Cuti' => $this->pendingCount(LeaveRequest::class, (int) $ownerId, $cutoff),
                'Lembur' => $this->pendingCount(OvertimeRequest::class, (int) $ownerId, $cutoff),
                'Perubahan Jadwal' => $this->pendingCount(ShiftChangeRequest::class, (int) $ownerId, $cutoff),
            ];
            $total = array_sum($counts);

            if ($total === 0) {
                continue;
            }

            $details = collect($counts)
                ->filter(fn (int $count) => $count > 0)
                ->map(fn (int $count, string $label) => "{$label}: {$count}")
                ->implode(', ');

            NotificationAnnouncement::query()->create([
                'user_id' => $ownerId,
                'title' => 'Reminder Approval Pending',
                'message' => "{$total} approval menunggu lebih dari {$hours} jam. {$details}. Mohon review dari menu Approval.",
                'audience' => 'all',
                'channel' => 'portal',
                'status' => 'published',
                'publish_at' => now(),
                'expires_at' => now()->addDay(),
            ]);

            $this->line("Owner #{$ownerId}: reminder approval pending dibuat ({$total} item).");
        }

        return self::SUCCESS;
    }

    /**
     * @param  class-string  $modelClass
     * @return array<int, int>
     */
    private function ownerIds(string $modelClass, CarbonInterface $cutoff): array
    {
        return $modelClass::query()
            ->where('status', 'pending')
            ->where('created_at', '<=', $cutoff)
            ->distinct()
            ->pluck('user_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    /**
     * @param  class-string  $modelClass
     */
    private function pendingCount(string $modelClass, int $ownerId, CarbonInterface $cutoff): int
    {
        return $modelClass::query()
            ->where('user_id', $ownerId)
            ->where('status', 'pending')
            ->where('created_at', '<=', $cutoff)
            ->count();
    }

    private function alreadyPublishedToday(int $ownerId, string $title, Carbon $today): bool
    {
        return NotificationAnnouncement::query()
            ->where('user_id', $ownerId)
            ->where('title', $title)
            ->whereDate('publish_at', $today->toDateString())
            ->exists();
    }
}
