<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->text('domicile_address')->nullable()->after('address');
            $table->string('emergency_contact_relationship', 80)->nullable()->after('emergency_contact_phone');
            $table->string('blood_type', 5)->nullable()->after('birth_date');
            $table->string('religion', 50)->nullable()->after('blood_type');
            $table->string('npwp_number', 32)->nullable()->after('ktp_number');
            $table->unsignedSmallInteger('contract_duration_months')->nullable()->after('employment_type');
            $table->date('contract_end_date')->nullable()->after('contract_duration_months');
            $table->unsignedTinyInteger('probation_duration_months')->nullable()->after('contract_end_date');
            $table->date('probation_end_date')->nullable()->after('probation_duration_months');
            $table->date('pkwtt_activated_at')->nullable()->after('probation_end_date');
        });

        Schema::create('employee_employment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_type', 40);
            $table->date('effective_date');
            $table->string('old_status', 30)->nullable();
            $table->string('new_status', 30)->nullable();
            $table->foreignId('old_division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->foreignId('new_division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->string('old_division_name')->nullable();
            $table->string('new_division_name')->nullable();
            $table->foreignId('old_position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->foreignId('new_position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->string('old_position_name')->nullable();
            $table->string('new_position_name')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'employee_id', 'effective_date'], 'employee_history_tenant_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_employment_histories');

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'domicile_address',
                'emergency_contact_relationship',
                'blood_type',
                'religion',
                'npwp_number',
                'contract_duration_months',
                'contract_end_date',
                'probation_duration_months',
                'probation_end_date',
                'pkwtt_activated_at',
            ]);
        });
    }
};
