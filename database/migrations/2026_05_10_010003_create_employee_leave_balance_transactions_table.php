<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_leave_balance_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('leave_type', 30);
            $table->unsignedSmallInteger('year');
            $table->decimal('amount', 5, 1);
            $table->string('type', 20); // grant | accrual | usage | reversal | adjustment
            $table->string('description', 255)->nullable();
            $table->foreignId('leave_request_id')->nullable()->nullOnDelete()->constrained('leave_requests');
            $table->decimal('balance_after', 5, 1);
            $table->date('effective_date');
            $table->timestamps();

            $table->index(['employee_id', 'leave_type', 'year'], 'elbt_employee_leave_year_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_leave_balance_transactions');
    }
};
