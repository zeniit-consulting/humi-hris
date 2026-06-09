<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceKpiResult extends Model
{
    use BelongsToAccount;

    protected $fillable = [
        'user_id',
        'performance_review_id',
        'performance_kpi_metric_id',
        'name',
        'unit',
        'target_value',
        'actual_value',
        'weight',
        'input_type',
        'attendance_metric',
        'direction',
        'score',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'target_value' => 'decimal:2',
            'actual_value' => 'decimal:2',
            'weight' => 'decimal:2',
            'score' => 'decimal:2',
        ];
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(PerformanceReview::class, 'performance_review_id');
    }

    public function metric(): BelongsTo
    {
        return $this->belongsTo(PerformanceKpiMetric::class, 'performance_kpi_metric_id');
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(PerformanceCheckIn::class, 'performance_kpi_result_id');
    }
}
