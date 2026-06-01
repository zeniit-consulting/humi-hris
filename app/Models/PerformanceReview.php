<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceReview extends Model
{
    use BelongsToAccount;

    public const STATUSES = [
        'not_started',
        'in_progress',
        'pending_manager_review',
        'completed',
        'locked',
    ];

    protected $fillable = [
        'user_id',
        'performance_period_id',
        'employee_id',
        'manager_id',
        'status',
        'okr_score',
        'kpi_score',
        'manager_score',
        'final_score',
        'manager_notes',
        'strengths',
        'improvement_areas',
        'next_action',
        'reviewed_at',
        'locked_at',
    ];

    protected function casts(): array
    {
        return [
            'okr_score' => 'decimal:2',
            'kpi_score' => 'decimal:2',
            'manager_score' => 'decimal:2',
            'final_score' => 'decimal:2',
            'reviewed_at' => 'datetime',
            'locked_at' => 'datetime',
        ];
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(PerformancePeriod::class, 'performance_period_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function objectives(): HasMany
    {
        return $this->hasMany(PerformanceObjective::class);
    }

    public function kpiResults(): HasMany
    {
        return $this->hasMany(PerformanceKpiResult::class);
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(PerformanceCheckIn::class);
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked' || $this->locked_at !== null || $this->period?->isClosed();
    }
}
