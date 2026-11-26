<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_leave_balance_transactions', function (Blueprint $table) {
            $table->dropForeign(['leave_request_id']);
            $table->foreign('leave_request_id')
                ->references('id')
                ->on('leave_requests')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('employee_leave_balance_transactions', function (Blueprint $table) {
            $table->dropForeign(['leave_request_id']);
            $table->foreign('leave_request_id')
                ->references('id')
                ->on('leave_requests');
        });
    }
};
