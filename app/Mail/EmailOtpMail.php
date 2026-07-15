<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otp,
        public readonly string $context = 'activation',
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->context === 'login'
                ? 'Kode OTP Login Portal Humi'
                : 'Kode OTP Aktivasi Akun Humi',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.email-otp');
    }
}
