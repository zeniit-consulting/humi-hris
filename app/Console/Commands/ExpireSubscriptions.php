<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscription:expire';

    protected $description = 'Otomatis ubah status subscription yang sudah lewat masa aktifnya menjadi expired';

    public function handle(SubscriptionService $subscriptionService): int
    {
        $before = \App\Models\Subscription::query()
            ->withoutGlobalScopes()
            ->whereIn('status', ['active', 'trial'])
            ->where('current_period_end', '<', now()->toDateString())
            ->count();

        if ($before === 0) {
            $this->info('Tidak ada subscription yang perlu di-expire.');

            return self::SUCCESS;
        }

        $subscriptionService->checkAndExpireSubscriptions();

        $this->info("Selesai. {$before} subscription di-expire.");

        return self::SUCCESS;
    }
}
