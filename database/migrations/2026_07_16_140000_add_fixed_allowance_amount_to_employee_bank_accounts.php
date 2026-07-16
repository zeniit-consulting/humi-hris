<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_bank_accounts', function (Blueprint $table): void {
            $table->decimal('fixed_allowance_amount', 15, 2)->default(0)->after('currency');
        });
    }

    public function down(): void
    {
        Schema::table('employee_bank_accounts', function (Blueprint $table): void {
            $table->dropColumn('fixed_allowance_amount');
        });
    }
};
