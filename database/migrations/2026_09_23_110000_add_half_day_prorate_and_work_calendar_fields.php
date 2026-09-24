<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->string('late_half_day_penalty_type', 30)->default('nominal')->after('late_half_day_penalty_amount');
            $table->boolean('unrecorded_cutoff_penalty_enabled')->default(false)->after('attendance_revision_cutoff_day');
        });

        Schema::table('public_holidays', function (Blueprint $table) {
            $table->string('holiday_type', 50)->default('national')->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('public_holidays', function (Blueprint $table) {
            $table->dropColumn('holiday_type');
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'late_half_day_penalty_type',
                'unrecorded_cutoff_penalty_enabled',
            ]);
        });
    }
};
