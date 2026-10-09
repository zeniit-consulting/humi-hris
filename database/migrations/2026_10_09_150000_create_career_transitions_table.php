<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('career_transitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('transition_number');
            $table->string('letter_number')->nullable();
            $table->string('transition_type'); // promotion, demotion, mutation, rotation, salary_adjustment, contract_change
            $table->date('effective_date');

            // Current data snapshot
            $table->foreignId('old_division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->string('old_division_name')->nullable();
            $table->foreignId('old_position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->string('old_position_name')->nullable();
            $table->foreignId('old_sub_company_id')->nullable()->constrained('sub_companies')->nullOnDelete();
            $table->string('old_sub_company_name')->nullable();
            $table->string('old_employment_status')->nullable();
            $table->string('old_employment_type')->nullable();
            $table->decimal('old_base_salary', 15, 2)->nullable();
            $table->decimal('old_daily_wage', 15, 2)->nullable();

            // Proposed new data
            $table->foreignId('new_division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->string('new_division_name')->nullable();
            $table->foreignId('new_position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->string('new_position_name')->nullable();
            $table->foreignId('new_sub_company_id')->nullable()->constrained('sub_companies')->nullOnDelete();
            $table->string('new_sub_company_name')->nullable();
            $table->string('new_employment_status')->nullable();
            $table->string('new_employment_type')->nullable();
            $table->decimal('new_base_salary', 15, 2)->nullable();
            $table->decimal('new_daily_wage', 15, 2)->nullable();

            // Justification & notes
            $table->string('reason');
            $table->text('notes')->nullable();
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();

            // Multi-tier Approval workflow
            $table->string('status')->default('pending'); // draft, pending, approved, rejected, applied
            $table->unsignedTinyInteger('approval_levels')->default(2);
            $table->unsignedTinyInteger('approval_stage')->default(0);
            $table->foreignId('first_approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('first_approved_at')->nullable();
            $table->text('first_approval_notes')->nullable();
            $table->foreignId('second_approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('second_approved_at')->nullable();
            $table->text('second_approval_notes')->nullable();
            $table->foreignId('rejected_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('created_by_user_id')->constrained('users')->cascadeOnDelete();

            // Official SK (Surat Keputusan) details
            $table->timestamp('sk_generated_at')->nullable();
            $table->string('sk_title')->nullable();
            $table->string('sk_signer_name')->nullable();
            $table->string('sk_signer_position')->nullable();
            $table->text('sk_considerations')->nullable();
            $table->text('sk_legal_basis')->nullable();
            $table->text('sk_decision_points')->nullable();
            $table->string('sk_document_path')->nullable();

            // Applied to employee record
            $table->timestamp('applied_at')->nullable();
            $table->foreignId('applied_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->unique(['user_id', 'transition_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('career_transitions');
    }
};
