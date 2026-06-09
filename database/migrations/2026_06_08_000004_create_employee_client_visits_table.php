<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_client_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('client_name');
            $table->text('work_description');
            $table->date('visit_date');
            $table->timestamp('clock_in_at');
            $table->decimal('clock_in_latitude', 10, 7);
            $table->decimal('clock_in_longitude', 10, 7);
            $table->timestamp('clock_out_at')->nullable();
            $table->decimal('clock_out_latitude', 10, 7)->nullable();
            $table->decimal('clock_out_longitude', 10, 7)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'visit_date']);
            $table->index(['employee_id', 'visit_date']);
            $table->index('clock_in_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_client_visits');
    }
};
