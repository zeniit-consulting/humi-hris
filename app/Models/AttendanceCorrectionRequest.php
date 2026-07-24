<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceCorrectionRequest extends Model
{
    use BelongsToAccount;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'employee_id',
        'attendance_date',
        'timezone',
        'shift_id',
        'check_in_at',
        'check_out_at',
        'reason',
        'status',
        'approval_levels', 'approval_stage', 'first_approver_employee_id', 'second_approver_employee_id', 'first_approved_by', 'first_approved_at', 'rejection_stage',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
            'approved_at' => 'datetime',
            'first_approved_at' => 'datetime', 'approval_levels' => 'integer', 'approval_stage' => 'integer', 'rejection_stage' => 'integer',
        ];
    }

    protected static function booted(): void { static::creating(fn (self $request) => app(\App\Services\ApprovalWorkflowService::class)->snapshot($request)); }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(WorkShift::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
