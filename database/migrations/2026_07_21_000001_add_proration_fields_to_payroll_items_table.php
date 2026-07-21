<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->boolean('is_prorated')->default(false)->after('allowances_total');
            $table->unsignedSmallInteger('proration_working_days')->nullable()->after('is_prorated');
            $table->unsignedSmallInteger('proration_payable_days')->nullable()->after('proration_working_days');
            $table->decimal('proration_factor', 8, 6)->default(1)->after('proration_payable_days');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->dropColumn([
                'is_prorated',
                'proration_working_days',
                'proration_payable_days',
                'proration_factor',
            ]);
        });
    }
};
