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
        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->unsignedTinyInteger('thr_months_of_service')->nullable()->after('net_salary');
            $table->decimal('thr_amount', 15, 2)->default(0)->after('thr_months_of_service');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->dropColumn(['thr_months_of_service', 'thr_amount']);
        });
    }
};
