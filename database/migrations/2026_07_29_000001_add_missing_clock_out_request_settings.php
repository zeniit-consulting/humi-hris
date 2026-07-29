<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table): void {
            $table->unsignedTinyInteger('missing_clock_out_request_days')
                ->default(2)
                ->after('auto_deduct_leave_for_missing_checkout');
            $table->string('attendance_revision_cutoff_day', 16)
                ->default('end_of_month')
                ->after('missing_clock_out_request_days');
        });

        Schema::table('attendance_correction_requests', function (Blueprint $table): void {
            $table->string('request_type', 32)
                ->default('manual_attendance')
                ->after('reason');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_correction_requests', function (Blueprint $table): void {
            $table->dropColumn('request_type');
        });

        Schema::table('company_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'missing_clock_out_request_days',
                'attendance_revision_cutoff_day',
            ]);
        });
    }
};
