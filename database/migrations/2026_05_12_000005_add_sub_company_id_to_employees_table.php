<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->foreignId('sub_company_id')->nullable()->constrained('sub_companies')->nullOnDelete();
            $table->index(['user_id', 'sub_company_id']);
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->dropIndex(['user_id', 'sub_company_id']);
            $table->dropConstrainedForeignId('sub_company_id');
        });
    }
};
