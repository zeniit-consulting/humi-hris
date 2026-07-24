<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->decimal('daily_wage', 15, 2)->nullable()->after('base_salary');
        });

        Schema::table('company_settings', function (Blueprint $table): void {
            $table->string('overtime_calculation_mode', 30)->default('hourly')->after('overtime_hour_divisor');
            $table->unsignedSmallInteger('overtime_threshold_hours')->default(8)->after('overtime_calculation_mode');
        });
    }

    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table): void {
            $table->dropColumn(['overtime_calculation_mode', 'overtime_threshold_hours']);
        });

        Schema::table('employees', function (Blueprint $table): void {
            $table->dropColumn('daily_wage');
        });
    }
};
