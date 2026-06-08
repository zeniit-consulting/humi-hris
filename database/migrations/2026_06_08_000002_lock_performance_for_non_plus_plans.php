<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['free', 'core'] as $planSlug) {
            $this->addLockedFeature($planSlug, 'performance');
        }
    }

    public function down(): void
    {
        foreach (['free', 'core'] as $planSlug) {
            $this->removeLockedFeature($planSlug, 'performance');
        }
    }

    private function addLockedFeature(string $planSlug, string $feature): void
    {
        $plan = DB::table('subscription_plans')
            ->where('slug', $planSlug)
            ->first();

        if (! $plan) {
            return;
        }

        $lockedFeatures = json_decode((string) $plan->locked_features, true);

        if (! is_array($lockedFeatures)) {
            $lockedFeatures = [];
        }

        if (! in_array($feature, $lockedFeatures, true)) {
            $lockedFeatures[] = $feature;
        }

        DB::table('subscription_plans')
            ->where('slug', $planSlug)
            ->update([
                'locked_features' => json_encode(array_values($lockedFeatures)),
                'updated_at' => now(),
            ]);
    }

    private function removeLockedFeature(string $planSlug, string $feature): void
    {
        $plan = DB::table('subscription_plans')
            ->where('slug', $planSlug)
            ->first();

        if (! $plan) {
            return;
        }

        $lockedFeatures = json_decode((string) $plan->locked_features, true);

        if (! is_array($lockedFeatures)) {
            return;
        }

        DB::table('subscription_plans')
            ->where('slug', $planSlug)
            ->update([
                'locked_features' => json_encode(array_values(array_filter(
                    $lockedFeatures,
                    fn (string $lockedFeature): bool => $lockedFeature !== $feature,
                ))),
                'updated_at' => now(),
            ]);
    }
};
