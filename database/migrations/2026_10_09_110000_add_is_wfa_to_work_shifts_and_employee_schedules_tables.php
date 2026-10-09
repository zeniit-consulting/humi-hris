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
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->string('code', 20)->change();
            $table->boolean('is_wfa')->default(false)->after('is_day_off');
        });

        Schema::table('employee_schedules', function (Blueprint $table) {
            $table->boolean('is_wfa')->default(false)->after('is_day_off');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_schedules', function (Blueprint $table) {
            $table->dropColumn('is_wfa');
        });

        Schema::table('work_shifts', function (Blueprint $table) {
            $table->dropColumn('is_wfa');
            $table->string('code', 10)->change();
        });
    }
};
