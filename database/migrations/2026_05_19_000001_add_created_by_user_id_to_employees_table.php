<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table
                ->foreignId('created_by_user_id')
                ->nullable()
                ->after('user_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->index(['user_id', 'created_by_user_id']);
        });

        DB::table('employees')
            ->whereNull('created_by_user_id')
            ->update(['created_by_user_id' => DB::raw('user_id')]);
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->dropIndex(['user_id', 'created_by_user_id']);
            $table->dropConstrainedForeignId('created_by_user_id');
        });
    }
};
