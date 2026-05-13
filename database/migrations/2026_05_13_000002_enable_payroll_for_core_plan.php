<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $plan = DB::table('subscription_plans')
            ->where('slug', 'core')
            ->first();

        if (! $plan) {
            return;
        }

        $lockedFeatures = json_decode((string) $plan->locked_features, true);

        if (! is_array($lockedFeatures)) {
            return;
        }

        DB::table('subscription_plans')
            ->where('slug', 'core')
            ->update([
                'locked_features' => json_encode(array_values(array_filter(
                    $lockedFeatures,
                    fn (string $feature): bool => $feature !== 'payroll',
                ))),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        $plan = DB::table('subscription_plans')
            ->where('slug', 'core')
            ->first();

        if (! $plan) {
            return;
        }

        $lockedFeatures = json_decode((string) $plan->locked_features, true);

        if (! is_array($lockedFeatures)) {
            $lockedFeatures = [];
        }

        if (! in_array('payroll', $lockedFeatures, true)) {
            $lockedFeatures[] = 'payroll';
        }

        DB::table('subscription_plans')
            ->where('slug', 'core')
            ->update([
                'locked_features' => json_encode(array_values($lockedFeatures)),
                'updated_at' => now(),
            ]);
    }
};
