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
        Schema::table('employees', function (Blueprint $table) {
            $table->string('salary_type', 20)->default('gross')->after('base_salary');
            $table->decimal('bpjs_kesehatan_reported_wage', 15, 2)->nullable()->after('bpjs_kesehatan_class');
        });

        Schema::table('payroll_items', function (Blueprint $table) {
            $table->string('salary_type', 20)->nullable()->after('pph21_method');
            $table->decimal('bpjs_kesehatan_reported_wage', 15, 2)->nullable()->after('bpjs_kesehatan_class');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll_items', function (Blueprint $table) {
            $table->dropColumn(['salary_type', 'bpjs_kesehatan_reported_wage']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['salary_type', 'bpjs_kesehatan_reported_wage']);
        });
    }
};
