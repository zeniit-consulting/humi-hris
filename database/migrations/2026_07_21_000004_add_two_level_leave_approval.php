<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_policies', function (Blueprint $table) {
            $table->unsignedTinyInteger('approval_levels')->default(1)->after('max_days_per_request');
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->unsignedTinyInteger('approval_stage')->default(0)->after('status');
            $table->foreignId('first_approved_by')->nullable()->after('approval_stage')->constrained('users')->nullOnDelete();
            $table->timestamp('first_approved_at')->nullable()->after('first_approved_by');
        });
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('first_approved_by');
            $table->dropColumn(['approval_stage', 'first_approved_at']);
        });

        Schema::table('leave_policies', function (Blueprint $table) {
            $table->dropColumn('approval_levels');
        });
    }
};
