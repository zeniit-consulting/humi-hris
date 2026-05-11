<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'price_per_employee',
        'max_employees',
        'max_months',
        'locked_features',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_per_employee' => 'integer',
            'max_employees' => 'integer',
            'max_months' => 'integer',
            'locked_features' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function isFeatureLocked(string $feature): bool
    {
        $locked = $this->locked_features ?? [];
        return in_array($feature, $locked, true);
    }
}
