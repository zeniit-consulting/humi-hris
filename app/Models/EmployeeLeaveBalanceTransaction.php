<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeLeaveBalanceTransaction extends Model
{
    use BelongsToAccount;

    protected $fillable = [
        'user_id',
        'employee_id',
        'leave_type',
        'year',
        'amount',
        'type',
        'description',
        'leave_request_id',
        'balance_after',
        'effective_date',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'balance_after' => 'float',
            'effective_date' => 'date',
            'year' => 'integer',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveRequest(): BelongsTo
    {
        return $this->belongsTo(LeaveRequest::class);
    }
}
