<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->foreignId('client_sub_company_id')
                ->nullable()
                ->after('parent_user_id')
                ->constrained('sub_companies')
                ->nullOnDelete();
            $table->index(['parent_user_id', 'client_sub_company_id']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['parent_user_id', 'client_sub_company_id']);
            $table->dropConstrainedForeignId('client_sub_company_id');
        });
    }
};
