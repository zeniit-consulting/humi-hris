<?php

namespace App\Console\Commands;

use App\Models\CompanySetting;
use App\Services\TelegramNotificationService;
use Illuminate\Console\Command;

class SendDailyAttendanceTelegramSummary extends Command
{
    protected $signature = 'attendance:telegram-daily-summary {--user= : User ID of the account owner}';

    protected $description = 'Kirim rekap absensi harian ke grup Telegram perusahaan';

    public function handle(TelegramNotificationService $telegramService): int
    {
        $userId = $this->option('user') ? (int) $this->option('user') : null;

        $settings = CompanySetting::withoutGlobalScopes()
            ->whereNotNull('telegram_group_chat_id')
            ->where('telegram_group_chat_id', '!=', '')
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->get();

        if ($settings->isEmpty()) {
            $this->info('Tidak ada perusahaan dengan telegram_group_chat_id yang aktif.');
            return self::SUCCESS;
        }

        foreach ($settings as $setting) {
            try {
                $telegramService->sendDailyAttendanceSummary($setting->user_id);
                $this->info("Rekap terkirim untuk: {$setting->name} (Chat ID: {$setting->telegram_group_chat_id})");
            } catch (\Throwable $e) {
                $this->error("Gagal mengirim untuk {$setting->name}: {$e->getMessage()}");
            }
        }

        return self::SUCCESS;
    }
}
