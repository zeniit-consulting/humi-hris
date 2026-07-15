<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('email_otp_code')->nullable()->after('email_verified_at');
            $table->timestamp('email_otp_sent_at')->nullable()->after('email_otp_code');
            $table->timestamp('email_otp_expires_at')->nullable()->after('email_otp_sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['email_otp_code', 'email_otp_sent_at', 'email_otp_expires_at']);
        });
    }
};
