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

        // Clean up any historical duplicate regular attendances before applying unique constraint
        $duplicates = DB::table('employee_attendances')
            ->select('employee_id', 'attendance_date', DB::raw('COUNT(*) as total'))
            ->where('is_backup', false)
            ->groupBy('employee_id', 'attendance_date')
            ->having('total', '>', 1)
            ->get();

        foreach ($duplicates as $duplicate) {
            $rows = DB::table('employee_attendances')
                ->where('employee_id', $duplicate->employee_id)
                ->where('attendance_date', $duplicate->attendance_date)
                ->where('is_backup', false)
                ->orderByRaw('CASE WHEN check_out_at IS NOT NULL THEN 3 WHEN check_in_at IS NOT NULL THEN 2 ELSE 1 END DESC')
                ->orderByDesc('id')
                ->get();

            $deleteIds = $rows->slice(1)->pluck('id')->all();
            if (! empty($deleteIds)) {
                DB::table('employee_attendances')->whereIn('id', $deleteIds)->delete();
            }
        }

        if (! Schema::hasColumn('employee_attendances', 'regular_attendance_key')) {
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('employee_attendances') && Schema::hasColumn('employee_attendances', 'regular_attendance_key')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                try {
                    $table->dropUnique('emp_att_regular_unique');
                } catch (\Throwable $e) {
                }

                $table->dropColumn('regular_attendance_key');
            });
        }
    }
};
