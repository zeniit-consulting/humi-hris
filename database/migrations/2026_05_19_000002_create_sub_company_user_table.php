<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sub_company_user', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sub_company_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'sub_company_id']);
            $table->index(['sub_company_id', 'user_id']);
        });

        DB::table('users')
            ->whereNotNull('client_sub_company_id')
            ->orderBy('id')
            ->get(['id', 'client_sub_company_id'])
            ->each(function ($user): void {
                DB::table('sub_company_user')->insertOrIgnore([
                    'user_id' => $user->id,
                    'sub_company_id' => $user->client_sub_company_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('sub_company_user');
    }
};
