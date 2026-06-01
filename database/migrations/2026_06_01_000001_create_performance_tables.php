<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->date('starts_at');
            $table->date('ends_at');
            $table->string('status', 30)->default('draft');
            $table->timestamps();

            $table->unique(['user_id', 'starts_at', 'ends_at']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('performance_kpi_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('division_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('position_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['division_id', 'position_id']);
        });

        Schema::create('performance_kpi_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performance_kpi_template_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('unit', 40)->nullable();
            $table->decimal('target_value', 12, 2)->default(100);
            $table->decimal('weight', 8, 2)->default(1);
            $table->string('input_type', 30)->default('manual');
            $table->string('attendance_metric', 40)->nullable();
            $table->string('direction', 30)->default('higher_is_better');
            $table->timestamps();

            $table->index(['user_id', 'input_type']);
        });

        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performance_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('status', 40)->default('not_started');
            $table->decimal('okr_score', 6, 2)->default(0);
            $table->decimal('kpi_score', 6, 2)->default(0);
            $table->decimal('manager_score', 6, 2)->nullable();
            $table->decimal('final_score', 6, 2)->default(0);
            $table->text('manager_notes')->nullable();
            $table->text('strengths')->nullable();
            $table->text('improvement_areas')->nullable();
            $table->text('next_action')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->unique(['performance_period_id', 'employee_id']);
            $table->index(['user_id', 'status']);
            $table->index(['manager_id', 'status']);
        });

        Schema::create('performance_objectives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performance_review_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('weight', 8, 2)->default(1);
            $table->decimal('score', 6, 2)->default(0);
            $table->string('status', 40)->default('not_started');
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('performance_key_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performance_objective_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('target_value', 12, 2)->default(100);
            $table->decimal('actual_value', 12, 2)->default(0);
            $table->string('unit', 40)->nullable();
            $table->decimal('score', 6, 2)->default(0);
            $table->string('status', 40)->default('not_started');
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('performance_kpi_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performance_review_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performance_kpi_metric_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('unit', 40)->nullable();
            $table->decimal('target_value', 12, 2)->default(100);
            $table->decimal('actual_value', 12, 2)->default(0);
            $table->decimal('weight', 8, 2)->default(1);
            $table->string('input_type', 30)->default('manual');
            $table->string('attendance_metric', 40)->nullable();
            $table->string('direction', 30)->default('higher_is_better');
            $table->decimal('score', 6, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'input_type']);
        });

        Schema::create('performance_check_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performance_review_id')->constrained()->cascadeOnDelete();
            $table->date('check_in_date');
            $table->text('summary');
            $table->text('action_items')->nullable();
            $table->string('status', 40)->default('open');
            $table->timestamps();

            $table->index(['user_id', 'check_in_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_check_ins');
        Schema::dropIfExists('performance_kpi_results');
        Schema::dropIfExists('performance_key_results');
        Schema::dropIfExists('performance_objectives');
        Schema::dropIfExists('performance_reviews');
        Schema::dropIfExists('performance_kpi_metrics');
        Schema::dropIfExists('performance_kpi_templates');
        Schema::dropIfExists('performance_periods');
    }
};
