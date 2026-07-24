<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OvertimeRequest extends Model
{
    /** @use HasFactory<\Database\Factories\OvertimeRequestFactory> */
    use HasFactory, BelongsToAccount;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'employee_id',
        'work_date',
        'start_time',
        'end_time',
        'break_minutes',
        'total_hours',
        'reason',
        'status',
        'approval_levels', 'approval_stage', 'first_approver_employee_id', 'second_approver_employee_id', 'first_approved_by', 'first_approved_at', 'rejection_stage',
        'approved_by',
        'approved_at',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'work_date' => 'date',
            'total_hours' => 'decimal:2',
            'break_minutes' => 'integer',
            'approved_at' => 'datetime',
            'first_approved_at' => 'datetime', 'approval_levels' => 'integer', 'approval_stage' => 'integer', 'rejection_stage' => 'integer',
        ];
    }

    protected static function booted(): void { static::creating(fn (self $request) => app(\App\Services\ApprovalWorkflowService::class)->snapshot($request)); }

    /**
     * Get employee for this overtime request.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get approver user.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
