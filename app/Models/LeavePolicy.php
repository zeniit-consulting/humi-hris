<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;

class LeavePolicy extends Model
{
    use BelongsToAccount;

    protected $fillable = [
        'user_id',
        'leave_type',
        'policy_type',
        'yearly_days',
        'max_days_per_request',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'yearly_days' => 'integer',
            'max_days_per_request' => 'integer',
        ];
    }

    public function isLumpSum(): bool
    {
        return $this->policy_type === 'lump_sum';
    }

    public function isAccrual(): bool
    {
        return $this->policy_type === 'accrual';
    }
}
