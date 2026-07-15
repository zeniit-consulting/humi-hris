<?php

namespace App\Services;

use App\Mail\EmailOtpMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EmailOtpService
{
    public function send(User $user, bool $strict = false, string $context = 'activation'): bool
    {
        $otp = app()->environment('testing')
            ? '123456'
            : (string) random_int(100000, 999999);

        $user->forceFill([
            'email_otp_code' => Hash::make($otp),
            'email_otp_sent_at' => now(),
            'email_otp_expires_at' => now()->addMinutes(10),
        ])->save();

        try {
            Mail::to($user->email)->send(new EmailOtpMail($otp, $context));

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
            ! $user->email_otp_code
            || ! $user->email_otp_expires_at
            || $user->email_otp_expires_at->isPast()
            || ! Hash::check($otp, $user->email_otp_code)
        ) {
            return false;
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_otp_code' => null,
            'email_otp_sent_at' => null,
            'email_otp_expires_at' => null,
        ])->save();

        return true;
    }

    public function canResend(User $user): bool
    {
        return $user->email_otp_sent_at === null
            || $user->email_otp_sent_at->lte(now()->subMinute());
    }
}
