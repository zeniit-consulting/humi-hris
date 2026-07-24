<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            if (! Schema::hasColumn('employees', 'service_fee_points')) {
                $table->decimal('service_fee_points', 8, 2)->default(0);
            }
        });

        Schema::table('payroll_runs', function (Blueprint $table): void {
            if (! Schema::hasColumn('payroll_runs', 'service_fee_total')) {
                $table->decimal('service_fee_total', 15, 2)->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('payroll_runs', function (Blueprint $table): void {
            if (Schema::hasColumn('payroll_runs', 'service_fee_total')) {
                $table->dropColumn('service_fee_total');
            }
        });

        Schema::table('employees', function (Blueprint $table): void {
            if (Schema::hasColumn('employees', 'service_fee_points')) {
                $table->dropColumn('service_fee_points');
            }
        });
    }
};
