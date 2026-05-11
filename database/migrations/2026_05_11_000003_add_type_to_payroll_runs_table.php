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
        // Step 1: add columns if they don't exist yet
        Schema::table('payroll_runs', function (Blueprint $table): void {
            if (! Schema::hasColumn('payroll_runs', 'type')) {
                $table->string('type', 20)->default('regular')->after('user_id');
            }
            if (! Schema::hasColumn('payroll_runs', 'thr_reference_date')) {
                $table->date('thr_reference_date')->nullable()->after('type');
            }
        });

        // Step 2: fill existing rows with 'regular' if type column was just added
        DB::table('payroll_runs')->whereNull('type')->orWhere('type', '')->update(['type' => 'regular']);

        // Step 3: create the new (user_id, period, type) unique index if not exists
        $newIndexExists = collect(DB::select("SHOW INDEX FROM payroll_runs WHERE Key_name = 'payroll_runs_user_id_period_type_unique'"))->isNotEmpty();
        if (! $newIndexExists) {
            Schema::table('payroll_runs', function (Blueprint $table): void {
                $table->unique(['user_id', 'period', 'type'], 'payroll_runs_user_id_period_type_unique');
            });
        }

        // Step 4: drop the old (user_id, period) unique — MySQL can now use the new index for the FK
        $oldIndexExists = collect(DB::select("SHOW INDEX FROM payroll_runs WHERE Key_name = 'payroll_runs_user_id_period_unique'"))->isNotEmpty();
        if ($oldIndexExists) {
            Schema::table('payroll_runs', function (Blueprint $table): void {
                $table->dropUnique('payroll_runs_user_id_period_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore old (user_id, period) unique first so FK constraint stays satisfied
        $oldIndexExists = collect(DB::select("SHOW INDEX FROM payroll_runs WHERE Key_name = 'payroll_runs_user_id_period_unique'"))->isNotEmpty();
        if (! $oldIndexExists) {
            Schema::table('payroll_runs', function (Blueprint $table): void {
                $table->unique(['user_id', 'period'], 'payroll_runs_user_id_period_unique');
            });
        }

        // Then drop the new unique and remove columns
        Schema::table('payroll_runs', function (Blueprint $table): void {
            $newIndexExists = collect(DB::select("SHOW INDEX FROM payroll_runs WHERE Key_name = 'payroll_runs_user_id_period_type_unique'"))->isNotEmpty();
            if ($newIndexExists) {
                $table->dropUnique('payroll_runs_user_id_period_type_unique');
            }
            if (Schema::hasColumn('payroll_runs', 'type')) {
                $table->dropColumn('type');
            }
            if (Schema::hasColumn('payroll_runs', 'thr_reference_date')) {
                $table->dropColumn('thr_reference_date');
            }
        });
    }
};
