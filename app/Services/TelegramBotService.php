<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramBotService
{
    private string $botToken;
    private string $baseUrl;

    public function __construct()
    {
        $this->botToken = (string) config('services.telegram.client_secret', '');
        $this->baseUrl = "https://api.telegram.org/bot{$this->botToken}";
    }

    public function isConfigured(): bool
    {
        return ! empty($this->botToken);
    }

    /**
     * Send text message with optional parse_mode and inline keyboard markup.
     *
     * @param array<int, array<int, array<string, string>>>|null $inlineKeyboard
     * @return array<string, mixed>
     */
    public function sendMessage(
        string|int $chatId,
        string $text,
        string $parseMode = 'HTML',
        ?array $inlineKeyboard = null,
        bool $disableWebPagePreview = true
    ): array {
        if (! $this->isConfigured()) {
            return ['ok' => false, 'description' => 'Telegram Bot token is not configured.'];
        }

        $payload = [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => $parseMode,
            'disable_web_page_preview' => $disableWebPagePreview,
        ];

        if (! empty($inlineKeyboard)) {
            $payload['reply_markup'] = json_encode(['inline_keyboard' => $inlineKeyboard]);
        }

        try {
            $response = Http::asJson()->timeout(10)->post("{$this->baseUrl}/sendMessage", $payload);
            return $response->json() ?? [];
        } catch (\Throwable $e) {
            Log::warning('telegram.send_message.failed', [
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
            ]);
            return ['ok' => false, 'description' => $e->getMessage()];
        }
    }

    /**
     * Answer a callback query from an inline keyboard button click.
     */
    public function answerCallbackQuery(string $callbackQueryId, ?string $text = null, bool $showAlert = false): array
    {
        if (! $this->isConfigured()) {
            return ['ok' => false];
        }

        $payload = [
            'callback_query_id' => $callbackQueryId,
            'show_alert' => $showAlert,
        ];

        if ($text !== null) {
            $payload['text'] = $text;
        }

        try {
            $response = Http::asJson()->timeout(10)->post("{$this->baseUrl}/answerCallbackQuery", $payload);
            return $response->json() ?? [];
        } catch (\Throwable $e) {
            Log::warning('telegram.answer_callback.failed', [
                'callback_query_id' => $callbackQueryId,
                'error' => $e->getMessage(),
            ]);
            return ['ok' => false];
        }
    }

    /**
     * Edit message text and remove/update keyboard after action is taken.
     */
    public function editMessageText(
        string|int $chatId,
        int $messageId,
        string $text,
        string $parseMode = 'HTML',
        ?array $inlineKeyboard = null
    ): array {
        if (! $this->isConfigured()) {
            return ['ok' => false];
        }

        $payload = [
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'text' => $text,
            'parse_mode' => $parseMode,
        ];

        if (! empty($inlineKeyboard)) {
            $payload['reply_markup'] = json_encode(['inline_keyboard' => $inlineKeyboard]);
        }

        try {
            $response = Http::asJson()->timeout(10)->post("{$this->baseUrl}/editMessageText", $payload);
            return $response->json() ?? [];
        } catch (\Throwable $e) {
            Log::warning('telegram.edit_message.failed', [
                'chat_id' => $chatId,
                'message_id' => $messageId,
                'error' => $e->getMessage(),
            ]);
            return ['ok' => false];
        }
    }

    /**
     * Send a document (PDF payslip, etc.) to Telegram chat.
     */
    public function sendDocument(
        string|int $chatId,
        string $fileContents,
        string $filename,
        string $caption = '',
        string $parseMode = 'HTML'
    ): array {
        if (! $this->isConfigured()) {
            return ['ok' => false];
        }

        try {
            $response = Http::timeout(20)
                ->attach('document', $fileContents, $filename)
                ->post("{$this->baseUrl}/sendDocument", [
                    'chat_id' => $chatId,
                    'caption' => $caption,
                    'parse_mode' => $parseMode,
                ]);

            return $response->json() ?? [];
        } catch (\Throwable $e) {
            Log::warning('telegram.send_document.failed', [
                'chat_id' => $chatId,
                'filename' => $filename,
                'error' => $e->getMessage(),
            ]);
            return ['ok' => false];
        }
    }
}
