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
            $table->decimal('manual_deduction_total', 15, 2)->default(0)->after('unpaid_leave_deduction');
            $table->json('manual_deduction_breakdown')->nullable()->after('manual_deduction_total');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->dropColumn(['manual_deduction_total', 'manual_deduction_breakdown']);
        });
    }
};
