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
        Schema::table('company_settings', function (Blueprint $table) {
            $table->string('payroll_cutoff_day', 16)->default('end_of_month')->after('attendance_revision_cutoff_day');
            $table->string('payroll_period_start_day', 16)->nullable()->after('payroll_cutoff_day');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn(['payroll_cutoff_day', 'payroll_period_start_day']);
        });
    }
};
