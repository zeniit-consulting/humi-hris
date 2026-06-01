<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformancePeriod extends Model
{
    use BelongsToAccount;

    public const STATUSES = ['draft', 'active', 'closed'];

    protected $fillable = [
        'user_id',
        'name',
        'starts_at',
        'ends_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'date',
            'ends_at' => 'date',
        ];
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(PerformanceReview::class);
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }
}
