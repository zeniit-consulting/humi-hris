<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('subscription_plans')
            ->where('slug', 'free')
            ->update(['max_months' => 1]);

        DB::table('subscription_plans')
            ->where('slug', 'core')
            ->update(['name' => 'Basic']);
    }

    public function down(): void
    {
        DB::table('subscription_plans')
            ->where('slug', 'free')
            ->update(['max_months' => 2]);

        DB::table('subscription_plans')
            ->where('slug', 'core')
            ->update(['name' => 'Core']);
    }
};
