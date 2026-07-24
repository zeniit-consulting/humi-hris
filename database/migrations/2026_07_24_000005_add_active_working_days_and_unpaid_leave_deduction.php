<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table): void {
            $table->unsignedSmallInteger('active_working_days')->default(22)->after('overtime_threshold_hours');
        });

        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->decimal('unpaid_leave_deduction', 15, 2)->default(0)->after('denda_deduction');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->dropColumn('unpaid_leave_deduction');
        });

        Schema::table('company_settings', function (Blueprint $table): void {
            $table->dropColumn('active_working_days');
        });
    }
};
