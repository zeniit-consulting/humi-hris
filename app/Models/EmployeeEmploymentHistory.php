<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeEmploymentHistory extends Model
{
    use BelongsToAccount, HasFactory;

    protected $fillable = [
        'user_id',
        'employee_id',
        'created_by_user_id',
        'event_type',
        'effective_date',
        'old_status',
        'new_status',
        'old_division_id',
        'new_division_id',
        'old_division_name',
        'new_division_name',
        'old_position_id',
        'new_position_id',
        'old_position_name',
        'new_position_name',
        'notes',
    ];

    protected function casts(): array
    {
        return ['effective_date' => 'date'];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
