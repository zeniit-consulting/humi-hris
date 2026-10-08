<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->string('status', 20)->default('draft')->after('is_saved');
            $table->timestamp('released_at')->nullable()->after('status');
            $table->foreignId('released_by')->nullable()->after('released_at')->constrained('users')->nullOnDelete();
        });

        // Migrate existing saved records to released status
        DB::table('payroll_runs')
            ->where('is_saved', true)
            ->update([
                'status' => 'released',
                'released_at' => DB::raw('saved_at'),
                'released_by' => DB::raw('saved_by'),
            ]);

        // Ensure unsaved records are explicitly marked as draft
        DB::table('payroll_runs')
            ->where('is_saved', false)
            ->update([
                'status' => 'draft',
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('released_by');
            $table->dropColumn(['status', 'released_at']);
        });
    }
};
