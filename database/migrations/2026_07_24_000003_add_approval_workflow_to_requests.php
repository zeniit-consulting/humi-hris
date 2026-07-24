<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        foreach (['attendance_correction_requests', 'leave_requests', 'overtime_requests', 'shift_change_requests'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                if (! Schema::hasColumn($tableName, 'approval_levels')) {
                    $table->unsignedTinyInteger('approval_levels')->default(1)->after('status');
                }
                if (! Schema::hasColumn($tableName, 'approval_stage')) {
                    $table->unsignedTinyInteger('approval_stage')->default(0)->after('approval_levels');
                }
                $table->foreignId('first_approver_employee_id')->nullable()->constrained('employees')->nullOnDelete();
                $table->foreignId('second_approver_employee_id')->nullable()->constrained('employees')->nullOnDelete();
                if (! Schema::hasColumn($tableName, 'first_approved_by')) {
                    $table->foreignId('first_approved_by')->nullable()->constrained('users')->nullOnDelete();
                }
                if (! Schema::hasColumn($tableName, 'first_approved_at')) {
                    $table->timestamp('first_approved_at')->nullable();
                }
                $table->unsignedTinyInteger('rejection_stage')->nullable();
            });
        }
    }
    public function down(): void {
        foreach (['attendance_correction_requests', 'leave_requests', 'overtime_requests', 'shift_change_requests'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                $table->dropConstrainedForeignId('first_approver_employee_id');
                $table->dropConstrainedForeignId('second_approver_employee_id');
                if (Schema::hasColumn($tableName, 'first_approved_by')) {
                    $table->dropConstrainedForeignId('first_approved_by');
                }
                if (Schema::hasColumn($tableName, 'approval_levels')) {
                    $table->dropColumn(['approval_levels', 'approval_stage', 'first_approved_at']);
                }
                $table->dropColumn('rejection_stage');
            });
        }
    }
};
