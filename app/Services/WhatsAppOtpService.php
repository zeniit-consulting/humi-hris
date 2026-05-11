<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class WhatsAppOtpService
{
    public function __construct(private readonly WahaClient $wahaClient) {}

    public function send(User $user, bool $strict = false, string $context = 'activation'): bool
    {
        $otp = $this->generateOtp();

        $user->forceFill([
            'whatsapp_otp_code' => Hash::make($otp),
            'whatsapp_otp_sent_at' => now(),
            'whatsapp_otp_expires_at' => now()->addMinutes(10),
        ])->save();

        if (app()->environment('testing')) {
            return true;
        }

        if (! config('services.waha.enabled')) {
            Log::info('WhatsApp activation OTP generated without provider delivery', [
                'user_id' => $user->id,
                'phone' => $user->phone,
                'otp' => $otp,
            ]);

            return true;
        }

        try {
            $this->wahaClient->sendTextToPhone($user->phone, $this->buildOtpMessage($otp, $context));

            return true;
        } catch (\Throwable $exception) {
            report($exception);

            if ($strict) {
                throw $exception;
            }

            return false;
        }
    }

    public function verify(User $user, string $otp): bool
    {
        if (
            ! $user->whatsapp_otp_code
            || ! $user->whatsapp_otp_expires_at
            || $user->whatsapp_otp_expires_at->isPast()
        ) {
            return false;
        }

        if (! Hash::check($otp, $user->whatsapp_otp_code)) {
            return false;
        }

        $user->forceFill([
            'phone_verified_at' => now(),
            'whatsapp_otp_code' => null,
            'whatsapp_otp_sent_at' => null,
            'whatsapp_otp_expires_at' => null,
        ])->save();

        return true;
    }

    public function canResend(User $user): bool
    {
        return $user->whatsapp_otp_sent_at === null
            || $user->whatsapp_otp_sent_at->lte(now()->subMinute());
    }

    private function generateOtp(): string
    {
        if (app()->environment('testing')) {
            return '123456';
        }

        return (string) random_int(100000, 999999);
    }

    private function buildOtpMessage(string $otp, string $context): string
    {
        $title = $context === 'login'
            ? 'Kode OTP login portal Anda: '.$otp
            : 'Kode OTP aktivasi akun Humi - Easy HR Management Anda: '.$otp;

        return implode("\n", [
            $title,
            'Kode berlaku selama 10 menit.',
            'Jangan bagikan kode ini kepada siapa pun.',
        ]);
    }
}
