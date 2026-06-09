<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('performance_check_ins', function (Blueprint $table) {
            $table
                ->foreignId('performance_kpi_result_id')
                ->nullable()
                ->after('performance_review_id')
                ->constrained('performance_kpi_results')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('performance_check_ins', function (Blueprint $table) {
            $table->dropConstrainedForeignId('performance_kpi_result_id');
        });
    }
};
