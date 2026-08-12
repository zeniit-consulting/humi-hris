<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_employment_histories', function (Blueprint $table) {
            $table->unsignedSmallInteger('old_contract_duration_months')->nullable();
            $table->unsignedSmallInteger('new_contract_duration_months')->nullable();
            $table->date('old_contract_end_date')->nullable();
            $table->date('new_contract_end_date')->nullable();
            $table->decimal('old_base_salary', 15, 2)->nullable();
            $table->decimal('new_base_salary', 15, 2)->nullable();
            $table->decimal('old_daily_wage', 15, 2)->nullable();
            $table->decimal('new_daily_wage', 15, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('employee_employment_histories', function (Blueprint $table) {
            $table->dropColumn([
                'old_contract_duration_months', 'new_contract_duration_months',
                'old_contract_end_date', 'new_contract_end_date',
                'old_base_salary', 'new_base_salary', 'old_daily_wage', 'new_daily_wage',
            ]);
        });
    }
};
