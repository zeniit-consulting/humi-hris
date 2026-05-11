<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan_slug',
        'status',
        'employee_count',
        'current_period_start',
        'current_period_end',
        'trial_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'current_period_start' => 'date',
            'current_period_end' => 'date',
            'trial_ends_at' => 'date',
            'employee_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(SubscriptionInvoice::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trial'], true)
            && $this->current_period_end->greaterThanOrEqualTo(Carbon::today());
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired'
            || (in_array($this->status, ['active', 'trial'], true)
                && $this->current_period_end->lessThan(Carbon::today()));
    }

    public function plan(): ?SubscriptionPlan
    {
        return SubscriptionPlan::query()
            ->where('slug', $this->plan_slug)
            ->first();
    }

    public function lockedFeatures(): array
    {
        return $this->plan()?->locked_features ?? [];
    }

    public function isFeatureLocked(string $feature): bool
    {
        return in_array($feature, $this->lockedFeatures(), true);
    }

    public function daysRemaining(): int
    {
        $diff = (int) Carbon::today()->diffInDays($this->current_period_end, false);
        return max(0, $diff);
    }
}
