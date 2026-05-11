<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('leave_type', 30)->default('annual');
            $table->enum('policy_type', ['lump_sum', 'accrual']);
            $table->unsignedTinyInteger('yearly_days')->default(12);
            $table->unsignedTinyInteger('max_days_per_request')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'leave_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_policies');
    }
};
