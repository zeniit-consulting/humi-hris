<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_attendances', function (Blueprint $table): void {
            $table->string('timezone', 64)->nullable()->after('attendance_date');
        });

        Schema::table('attendance_correction_requests', function (Blueprint $table): void {
            $table->string('timezone', 64)->nullable()->after('attendance_date');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_correction_requests', function (Blueprint $table): void {
            $table->dropColumn('timezone');
        });

        Schema::table('employee_attendances', function (Blueprint $table): void {
            $table->dropColumn('timezone');
        });
    }
};
