<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeLeaveBalance extends Model
{
    use BelongsToAccount;

    protected $fillable = [
        'user_id',
        'employee_id',
        'leave_type',
        'year',
        'policy_type',
        'total_quota',
        'accrued_days',
        'used_days',
        'adjusted_days',
    ];

    protected function casts(): array
    {
        return [
            'total_quota' => 'float',
            'accrued_days' => 'float',
            'used_days' => 'float',
            'adjusted_days' => 'float',
            'year' => 'integer',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(EmployeeLeaveBalanceTransaction::class, 'employee_id', 'employee_id')
            ->where('leave_type', $this->leave_type)
            ->where('year', $this->year);
    }

    public function remainingBalance(): float
    {
        return $this->accrued_days - $this->used_days + $this->adjusted_days;
    }

    public function canTake(float $days): bool
    {
        return $this->remainingBalance() >= $days;
    }
}
