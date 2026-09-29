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
        if (Schema::hasTable('company_settings') && ! Schema::hasColumn('company_settings', 'backup_attendance_enabled')) {
            Schema::table('company_settings', function (Blueprint $table): void {
                $table->boolean('backup_attendance_enabled')->default(false)->after('portal_kasbon_enabled');
            });
        }

        if (Schema::hasTable('employee_attendances')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                if (Schema::hasColumn('employee_attendances', 'employee_id')) {
                    try {
                        $table->index('employee_id', 'employee_attendances_employee_id_index');
                    } catch (\Throwable $e) {
                    }
                }

                if (Schema::hasColumn('employee_attendances', 'employee_id') && Schema::hasColumn('employee_attendances', 'attendance_date')) {
                    try {
                        $table->dropUnique('employee_attendances_employee_id_attendance_date_unique');
                    } catch (\Throwable $e) {
                        // In case the index had a different name or was already dropped
                    }
                }

                if (! Schema::hasColumn('employee_attendances', 'is_backup')) {
                    $table->boolean('is_backup')->default(false)->after('shift_id');
                }

                if (! Schema::hasColumn('employee_attendances', 'backup_for_employee_id')) {
                    $table->foreignId('backup_for_employee_id')
                        ->nullable()
                        ->after('is_backup')
                        ->constrained('employees')
                        ->nullOnDelete();
                }

                if (! Schema::hasColumn('employee_attendances', 'backup_by_employee_id')) {
                    $table->foreignId('backup_by_employee_id')
                        ->nullable()
                        ->after('backup_for_employee_id')
                        ->constrained('employees')
                        ->nullOnDelete();
                }

                $table->index(['backup_for_employee_id', 'attendance_date'], 'emp_att_backup_for_date_idx');
                $table->index(['is_backup', 'attendance_date'], 'emp_att_is_backup_date_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('company_settings') && Schema::hasColumn('company_settings', 'backup_attendance_enabled')) {
            Schema::table('company_settings', function (Blueprint $table): void {
                $table->dropColumn('backup_attendance_enabled');
            });
        }

        if (Schema::hasTable('employee_attendances')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                $table->dropIndex('emp_att_backup_for_date_idx');
                $table->dropIndex('emp_att_is_backup_date_idx');
                $table->dropForeign(['backup_for_employee_id']);
                $table->dropForeign(['backup_by_employee_id']);
                $table->dropColumn(['backup_by_employee_id', 'backup_for_employee_id', 'is_backup']);
                $table->unique(['employee_id', 'attendance_date'], 'employee_attendances_employee_id_attendance_date_unique');
            });
        }
    }
};
