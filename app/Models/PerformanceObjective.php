<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceObjective extends Model
{
    use BelongsToAccount;

    public const STATUSES = ['not_started', 'on_track', 'at_risk', 'off_track', 'completed'];

    protected $fillable = [
        'user_id',
        'performance_review_id',
        'title',
        'description',
        'weight',
        'score',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'decimal:2',
            'score' => 'decimal:2',
        ];
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(PerformanceReview::class, 'performance_review_id');
    }

    public function keyResults(): HasMany
    {
        return $this->hasMany(PerformanceKeyResult::class);
    }
}
