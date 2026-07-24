<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalSetting extends Model
{
    use BelongsToAccount;

    public const TYPES = ['attendance', 'leave', 'overtime', 'shift_change'];
    protected $fillable = ['user_id', 'request_type', 'two_line_enabled', 'first_approver_employee_id', 'second_approver_employee_id'];
    protected function casts(): array { return ['two_line_enabled' => 'boolean']; }
    public function firstApprover(): BelongsTo { return $this->belongsTo(Employee::class, 'first_approver_employee_id'); }
    public function secondApprover(): BelongsTo { return $this->belongsTo(Employee::class, 'second_approver_employee_id'); }
}
