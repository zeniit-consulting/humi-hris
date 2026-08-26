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
            $table->boolean('bpjs_jkk_enabled')->default(true)->after('bpjs_ketenagakerjaan_enabled');
            $table->boolean('bpjs_jkm_enabled')->default(true)->after('bpjs_jkk_enabled');
            $table->boolean('bpjs_jht_enabled')->default(true)->after('bpjs_jkm_enabled');
            $table->boolean('bpjs_jp_enabled')->default(true)->after('bpjs_jht_enabled');
            $table->string('bpjs_kesehatan_default_class', 10)->default('I')->after('bpjs_jp_enabled');
            $table->boolean('private_insurance_enabled')->default(false)->after('bpjs_kesehatan_default_class');
            $table->string('private_insurance_name', 100)->nullable()->after('private_insurance_enabled');
            $table->decimal('private_insurance_nominal', 15, 2)->default(0)->after('private_insurance_name');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->boolean('bpjs_jkk_enabled')->default(true)->after('bpjs_ketenagakerjaan_enabled');
            $table->boolean('bpjs_jkm_enabled')->default(true)->after('bpjs_jkk_enabled');
            $table->boolean('bpjs_jht_enabled')->default(true)->after('bpjs_jkm_enabled');
            $table->string('bpjs_kesehatan_class', 10)->nullable()->default('I')->after('bpjs_jp_enabled');
            $table->boolean('private_insurance_enabled')->default(false)->after('bpjs_kesehatan_class');
            $table->string('private_insurance_name', 100)->nullable()->after('private_insurance_enabled');
            $table->decimal('private_insurance_nominal', 15, 2)->default(0)->after('private_insurance_name');
        });

        Schema::table('payroll_items', function (Blueprint $table) {
            $table->string('bpjs_kesehatan_class', 10)->nullable()->after('bpjs_kesehatan_employee');
            $table->string('private_insurance_name', 100)->nullable()->after('bpjs_total_employee');
            $table->decimal('private_insurance_nominal', 15, 2)->default(0)->after('private_insurance_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll_items', function (Blueprint $table) {
            $table->dropColumn([
                'bpjs_kesehatan_class',
                'private_insurance_name',
                'private_insurance_nominal',
            ]);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'bpjs_jkk_enabled',
                'bpjs_jkm_enabled',
                'bpjs_jht_enabled',
                'bpjs_kesehatan_class',
                'private_insurance_enabled',
                'private_insurance_name',
                'private_insurance_nominal',
            ]);
        });

        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'bpjs_jkk_enabled',
                'bpjs_jkm_enabled',
                'bpjs_jht_enabled',
                'bpjs_jp_enabled',
                'bpjs_kesehatan_default_class',
                'private_insurance_enabled',
                'private_insurance_name',
                'private_insurance_nominal',
            ]);
        });
    }
};
