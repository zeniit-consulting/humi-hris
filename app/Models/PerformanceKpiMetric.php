<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceKpiMetric extends Model
{
    use BelongsToAccount;

    public const INPUT_TYPES = ['manual', 'attendance'];

    public const ATTENDANCE_METRICS = ['attendance_rate', 'on_time_rate', 'late_count', 'absent_count'];

    public const DIRECTIONS = ['higher_is_better', 'lower_is_better'];

    protected $fillable = [
        'user_id',
        'performance_kpi_template_id',
        'name',
        'description',
        'unit',
        'target_value',
        'weight',
        'input_type',
        'attendance_metric',
        'direction',
    ];

    protected function casts(): array
    {
        return [
            'target_value' => 'decimal:2',
            'weight' => 'decimal:2',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(PerformanceKpiTemplate::class, 'performance_kpi_template_id');
    }
}
