<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->date('offboarded_at')->nullable()->after('hire_date');
            $table->string('offboarding_reason', 100)->nullable()->after('offboarded_at');
            $table->text('offboarding_notes')->nullable()->after('offboarding_reason');

            $table->index(['user_id', 'offboarded_at']);
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->dropIndex(['user_id', 'offboarded_at']);
            $table->dropColumn([
                'offboarded_at',
                'offboarding_reason',
                'offboarding_notes',
            ]);
        });
    }
};
