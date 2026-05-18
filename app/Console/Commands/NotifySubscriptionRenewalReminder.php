<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Services\WhatsAppNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class NotifySubscriptionRenewalReminder extends Command
{
    protected $signature = 'subscription:notify-renewal-reminder {--days=7 : Jumlah hari sebelum masa aktif berakhir}';

    protected $description = 'Kirim reminder WhatsApp renewal subscription sebelum masa aktif plan berakhir';

    public function handle(WhatsAppNotificationService $notificationService): int
    {
        $days = max(1, (int) $this->option('days'));
        $targetDate = Carbon::today()->addDays($days)->toDateString();
        $sent = 0;

        Subscription::query()
            ->with('user:id,name,company_name,email,phone')
            ->whereIn('status', ['active', 'trial'])
            ->whereDate('current_period_end', $targetDate)
            ->orderBy('id')
            ->chunkById(100, function ($subscriptions) use ($notificationService, &$sent): void {
                foreach ($subscriptions as $subscription) {
                    $notificationService->notifySubscriptionRenewalReminder($subscription);
                    $sent++;
                }
            });

        $this->info("Reminder renewal selesai. Terkirim: {$sent}.");

        return self::SUCCESS;
    }
}
