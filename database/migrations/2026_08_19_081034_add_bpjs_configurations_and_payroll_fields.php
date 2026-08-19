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
        Schema::table('company_settings', function (Blueprint $table) {
            $table->boolean('bpjs_kesehatan_enabled')->default(false)->after('auto_overtime_min_minutes');
            $table->boolean('bpjs_ketenagakerjaan_enabled')->default(false)->after('bpjs_kesehatan_enabled');
            $table->decimal('bpjs_kesehatan_wage_cap', 15, 2)->default(12000000)->after('bpjs_ketenagakerjaan_enabled');
            $table->decimal('bpjs_jp_wage_cap', 15, 2)->default(10042300)->after('bpjs_kesehatan_wage_cap');
            $table->decimal('bpjs_jkk_rate', 5, 3)->default(0.240)->after('bpjs_jp_wage_cap');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->boolean('bpjs_kesehatan_enabled')->default(false)->after('bpjs_ketenagakerjaan_number');
            $table->boolean('bpjs_ketenagakerjaan_enabled')->default(false)->after('bpjs_kesehatan_enabled');
            $table->boolean('bpjs_jp_enabled')->default(false)->after('bpjs_ketenagakerjaan_enabled');
        });

        Schema::table('payroll_items', function (Blueprint $table) {
            $table->decimal('bpjs_kesehatan_company', 15, 2)->default(0)->after('pph21_company_borne');
            $table->decimal('bpjs_kesehatan_employee', 15, 2)->default(0)->after('bpjs_kesehatan_company');
            $table->decimal('bpjs_jkk_company', 15, 2)->default(0)->after('bpjs_kesehatan_employee');
            $table->decimal('bpjs_jkm_company', 15, 2)->default(0)->after('bpjs_jkk_company');
            $table->decimal('bpjs_jht_company', 15, 2)->default(0)->after('bpjs_jkm_company');
            $table->decimal('bpjs_jht_employee', 15, 2)->default(0)->after('bpjs_jht_company');
            $table->decimal('bpjs_jp_company', 15, 2)->default(0)->after('bpjs_jht_employee');
            $table->decimal('bpjs_jp_employee', 15, 2)->default(0)->after('bpjs_jp_company');
            $table->decimal('bpjs_total_company', 15, 2)->default(0)->after('bpjs_jp_employee');
            $table->decimal('bpjs_total_employee', 15, 2)->default(0)->after('bpjs_total_company');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll_items', function (Blueprint $table) {
            $table->dropColumn([
                'bpjs_kesehatan_company',
                'bpjs_kesehatan_employee',
                'bpjs_jkk_company',
                'bpjs_jkm_company',
                'bpjs_jht_company',
                'bpjs_jht_employee',
                'bpjs_jp_company',
                'bpjs_jp_employee',
                'bpjs_total_company',
                'bpjs_total_employee',
            ]);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'bpjs_kesehatan_enabled',
                'bpjs_ketenagakerjaan_enabled',
                'bpjs_jp_enabled',
            ]);
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'bpjs_kesehatan_enabled',
                'bpjs_ketenagakerjaan_enabled',
                'bpjs_kesehatan_wage_cap',
                'bpjs_jp_wage_cap',
                'bpjs_jkk_rate',
            ]);
        });
    }
};
