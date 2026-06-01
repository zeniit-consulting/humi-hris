<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceCheckIn extends Model
{
    use BelongsToAccount;

    public const STATUSES = ['open', 'done'];

    protected $fillable = [
        'user_id',
        'performance_review_id',
        'check_in_date',
        'summary',
        'action_items',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'check_in_date' => 'date',
        ];
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(PerformanceReview::class, 'performance_review_id');
    }
}
