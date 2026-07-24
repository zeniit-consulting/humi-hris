<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('approval_settings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('request_type', 30);
            $table->boolean('two_line_enabled')->default(false);
            $table->foreignId('first_approver_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('second_approver_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'request_type']);
        });
    }
    public function down(): void { Schema::dropIfExists('approval_settings'); }
};
