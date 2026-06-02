<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscription_invoices', function (Blueprint $table): void {
            $table->string('payment_gateway')->nullable()->after('status')->index();
            $table->string('payment_method')->nullable()->after('payment_gateway');
            $table->text('payment_number')->nullable()->after('payment_method');
            $table->bigInteger('payment_fee')->default(0)->after('payment_number');
            $table->bigInteger('total_payment')->nullable()->after('payment_fee');
            $table->dateTime('payment_expires_at')->nullable()->after('total_payment');
            $table->json('payment_payload')->nullable()->after('payment_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('subscription_invoices', function (Blueprint $table): void {
            $table->dropColumn([
                'payment_gateway',
                'payment_method',
                'payment_number',
                'payment_fee',
                'total_payment',
                'payment_expires_at',
                'payment_payload',
            ]);
        });
    }
};
