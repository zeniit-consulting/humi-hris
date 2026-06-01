<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceKeyResult extends Model
{
    use BelongsToAccount;

    public const STATUSES = ['not_started', 'on_track', 'at_risk', 'off_track', 'completed'];

    protected $fillable = [
        'user_id',
        'performance_objective_id',
        'title',
        'target_value',
        'actual_value',
        'unit',
        'score',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'target_value' => 'decimal:2',
            'actual_value' => 'decimal:2',
            'score' => 'decimal:2',
        ];
    }

    public function objective(): BelongsTo
    {
        return $this->belongsTo(PerformanceObjective::class, 'performance_objective_id');
    }
}
