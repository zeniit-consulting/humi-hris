<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->json('variable_allowance_breakdown')->nullable()->after('allowance_breakdown');
            $table->json('bonus_breakdown')->nullable()->after('variable_allowance_breakdown');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->dropColumn(['variable_allowance_breakdown', 'bonus_breakdown']);
        });
    }
};
