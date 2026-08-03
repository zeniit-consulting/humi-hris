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
        Schema::table('company_settings', function (Blueprint $table): void {
            $table->boolean('show_sub_company_menu')->default(true)->after('employee_activation_otp_enabled');
            $table->boolean('show_manpower_request_menu')->default(true)->after('show_sub_company_menu');
            $table->boolean('show_outsourcing_dashboard')->default(true)->after('show_manpower_request_menu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'show_sub_company_menu',
                'show_manpower_request_menu',
                'show_outsourcing_dashboard',
            ]);
        });
    }
};
