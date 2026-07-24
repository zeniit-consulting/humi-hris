<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftChangeRequest extends Model
{
    use BelongsToAccount;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'employee_id',
        'requested_date',
        'current_shift_id',
        'requested_shift_id',
        'reason',
        'status',
        'approval_levels', 'approval_stage', 'first_approver_employee_id', 'second_approver_employee_id', 'first_approved_by', 'first_approved_at', 'rejection_stage',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'requested_date' => 'date',
            'approved_at' => 'datetime',
            'first_approved_at' => 'datetime', 'approval_levels' => 'integer', 'approval_stage' => 'integer', 'rejection_stage' => 'integer',
        ];
    }

    protected static function booted(): void { static::creating(fn (self $request) => app(\App\Services\ApprovalWorkflowService::class)->snapshot($request)); }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function currentShift(): BelongsTo
    {
        return $this->belongsTo(WorkShift::class, 'current_shift_id');
    }

    public function requestedShift(): BelongsTo
    {
        return $this->belongsTo(WorkShift::class, 'requested_shift_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
