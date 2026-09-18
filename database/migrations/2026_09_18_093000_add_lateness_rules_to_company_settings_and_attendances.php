<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->boolean('late_penalty_enabled')->default(false)->after('require_face_recognition');
            $table->unsignedInteger('late_tolerance_minutes')->default(15)->after('late_penalty_enabled');
            $table->string('late_penalty_type', 20)->default('tiered')->after('late_tolerance_minutes');
            $table->json('late_penalty_tiers')->nullable()->after('late_penalty_type');
            $table->unsignedInteger('late_base_penalty_minutes')->default(15)->after('late_penalty_tiers');
            $table->decimal('late_base_penalty_amount', 12, 2)->default(0)->after('late_base_penalty_minutes');
            $table->decimal('late_incremental_penalty_amount', 12, 2)->default(0)->after('late_base_penalty_amount');
            $table->unsignedInteger('late_incremental_unit_minutes')->default(1)->after('late_incremental_penalty_amount');
            $table->boolean('late_half_day_enabled')->default(false)->after('late_incremental_unit_minutes');
            $table->unsignedInteger('late_half_day_cutoff_minutes')->default(60)->after('late_half_day_enabled');
            $table->decimal('late_half_day_penalty_amount', 12, 2)->default(0)->after('late_half_day_cutoff_minutes');
            $table->boolean('late_half_day_deduct_leave')->default(true)->after('late_half_day_penalty_amount');
        });

        Schema::table('employee_attendances', function (Blueprint $table) {
            $table->decimal('late_penalty', 12, 2)->default(0)->after('late_level');
            $table->boolean('is_half_day')->default(false)->after('late_penalty');
        });
    }

    public function down(): void
    {
        Schema::table('employee_attendances', function (Blueprint $table) {
            $table->dropColumn(['late_penalty', 'is_half_day']);
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'late_penalty_enabled',
                'late_tolerance_minutes',
                'late_penalty_type',
                'late_penalty_tiers',
                'late_base_penalty_minutes',
                'late_base_penalty_amount',
                'late_incremental_penalty_amount',
                'late_incremental_unit_minutes',
                'late_half_day_enabled',
                'late_half_day_cutoff_minutes',
                'late_half_day_penalty_amount',
                'late_half_day_deduct_leave',
            ]);
        });
    }
};
