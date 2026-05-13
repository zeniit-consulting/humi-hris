<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manpower_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sub_company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('position_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('job_vacancy_id')->nullable()->constrained()->nullOnDelete();
            $table->string('request_number', 60);
            $table->string('title', 150);
            $table->unsignedInteger('requested_headcount')->default(1);
            $table->unsignedInteger('fulfilled_headcount')->default(0);
            $table->date('needed_by')->nullable();
            $table->string('status', 30)->default('open');
            $table->string('priority', 20)->default('normal');
            $table->text('requirements')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'request_number']);
            $table->index(['user_id', 'sub_company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manpower_requests');
    }
};
