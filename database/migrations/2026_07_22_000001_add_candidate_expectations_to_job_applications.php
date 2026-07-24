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
        Schema::table('job_applications', function (Blueprint $table) {
            $table->decimal('take_home_pay_min', 15, 2)->nullable()->after('current_company');
            $table->decimal('take_home_pay_max', 15, 2)->nullable()->after('take_home_pay_min');
            $table->date('expected_join_date')->nullable()->after('expected_salary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn([
                'take_home_pay_min',
                'take_home_pay_max',
                'expected_join_date',
            ]);
        });
    }
};
