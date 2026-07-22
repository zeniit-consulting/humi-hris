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
        'waiting_period_months',
        'max_days_per_request',
        'approval_levels',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'yearly_days' => 'integer',
            'waiting_period_months' => 'integer',
            'max_days_per_request' => 'integer',
            'approval_levels' => 'integer',
        ];
    }

    public function isLumpSum(): bool
    {
        return in_array($this->policy_type, ['annual', 'prorated', 'anniversary'], true);
    }

    public function isAccrual(): bool
    {
        return $this->policy_type === 'monthly_accrual';
    }
}
