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
        Schema::table('employees', function (Blueprint $table): void {
            $table->decimal('pph21_rate', 15, 2)->default(0)->change();
        });

        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->decimal('pph21_rate', 15, 2)->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll_items', function (Blueprint $table): void {
            $table->decimal('pph21_rate', 5, 2)->default(0)->change();
        });

        Schema::table('employees', function (Blueprint $table): void {
            $table->decimal('pph21_rate', 5, 2)->default(0)->change();
        });
    }
};
