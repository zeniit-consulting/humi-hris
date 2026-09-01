<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('telegram_chat_id')->nullable()->after('phone');
            $table->string('telegram_username')->nullable()->after('telegram_chat_id');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('telegram_chat_id')->nullable()->after('phone');
            $table->string('telegram_username')->nullable()->after('telegram_chat_id');
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->string('telegram_group_chat_id')->nullable()->after('details');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn('telegram_group_chat_id');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['telegram_chat_id', 'telegram_username']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telegram_chat_id', 'telegram_username']);
        });
    }
};
