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
            $table->string('overtime_rate_type')->default('formula')->after('overtime_calculation_mode');
            $table->decimal('overtime_fixed_rate_per_hour', 15, 2)->nullable()->after('overtime_rate_type');
            $table->boolean('auto_overtime_from_attendance')->default(false)->after('overtime_events');
            $table->unsignedInteger('auto_overtime_min_minutes')->default(30)->after('auto_overtime_from_attendance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'overtime_rate_type',
                'overtime_fixed_rate_per_hour',
                'auto_overtime_from_attendance',
                'auto_overtime_min_minutes',
            ]);
        });
    }
};
