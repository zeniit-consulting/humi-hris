<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_reprimands', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('reprimand_number', 60);
            $table->string('level', 20);
            $table->date('issued_date');
            $table->date('incident_date')->nullable();
            $table->string('subject', 180);
            $table->text('description')->nullable();
            $table->text('action_plan')->nullable();
            $table->string('status', 30)->default('active');
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'reprimand_number']);
            $table->index(['user_id', 'employee_id', 'status']);
            $table->index(['user_id', 'issued_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_reprimands');
    }
};
