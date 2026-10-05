<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('employee_attendances')) {
            return;
        }

        if (! Schema::hasColumn('employee_attendances', 'deleted_at')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                $table->softDeletes()->after('updated_at');
            });
        }

        if (Schema::hasColumn('employee_attendances', 'regular_attendance_key')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                try {
                    $table->dropUnique('emp_att_regular_unique');
                } catch (\Throwable $e) {
                }

                $table->dropColumn('regular_attendance_key');
            });

            Schema::table('employee_attendances', function (Blueprint $table): void {
                $driver = DB::getDriverName();

                if ($driver === 'sqlite') {
                    $table->string('regular_attendance_key')
                        ->virtualAs("CASE WHEN is_backup = 0 AND deleted_at IS NULL THEN employee_id || '_' || attendance_date ELSE NULL END")
                        ->nullable();
                } else {
                    $table->string('regular_attendance_key', 64)
                        ->virtualAs("CASE WHEN is_backup = 0 AND deleted_at IS NULL THEN CONCAT(employee_id, '_', attendance_date) ELSE NULL END")
                        ->nullable();
                }

                $table->unique('regular_attendance_key', 'emp_att_regular_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('employee_attendances')) {
            return;
        }

        if (Schema::hasColumn('employee_attendances', 'regular_attendance_key')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                try {
                    $table->dropUnique('emp_att_regular_unique');
                } catch (\Throwable $e) {
                }

                $table->dropColumn('regular_attendance_key');
            });

            Schema::table('employee_attendances', function (Blueprint $table): void {
                $driver = DB::getDriverName();

                if ($driver === 'sqlite') {
                    $table->string('regular_attendance_key')
                        ->virtualAs("CASE WHEN is_backup = 0 THEN employee_id || '_' || attendance_date ELSE NULL END")
                        ->nullable();
                } else {
                    $table->string('regular_attendance_key', 64)
                        ->virtualAs("CASE WHEN is_backup = 0 THEN CONCAT(employee_id, '_', attendance_date) ELSE NULL END")
                        ->nullable();
                }

                $table->unique('regular_attendance_key', 'emp_att_regular_unique');
            });
        }

        if (Schema::hasColumn('employee_attendances', 'deleted_at')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                $table->dropSoftDeletes();
            });
        }
    }
};
