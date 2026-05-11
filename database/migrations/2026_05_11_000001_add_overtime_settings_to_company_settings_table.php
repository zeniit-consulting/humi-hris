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
        Schema::table('company_settings', function (Blueprint $table): void {
            $table->unsignedSmallInteger('overtime_hour_divisor')->default(173)->after('attendance_locations');
            $table->decimal('overtime_multiplier_hour1', 3, 1)->default(1.5)->after('overtime_hour_divisor');
            $table->decimal('overtime_multiplier_subsequent', 3, 1)->default(2.0)->after('overtime_multiplier_hour1');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'overtime_hour_divisor',
                'overtime_multiplier_hour1',
                'overtime_multiplier_subsequent',
            ]);
        });
    }
};
