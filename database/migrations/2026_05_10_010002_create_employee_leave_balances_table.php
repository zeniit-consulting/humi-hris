<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('leave_type', 30);
            $table->unsignedSmallInteger('year');
            $table->string('policy_type', 20);
            $table->decimal('total_quota', 5, 1);
            $table->decimal('accrued_days', 5, 1)->default(0);
            $table->decimal('used_days', 5, 1)->default(0);
            $table->decimal('adjusted_days', 5, 1)->default(0);
            $table->timestamps();

            $table->unique(['employee_id', 'leave_type', 'year']);
            $table->index(['user_id', 'year', 'leave_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_leave_balances');
    }
};
