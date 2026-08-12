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
        'old_contract_duration_months', 'new_contract_duration_months',
        'old_contract_end_date', 'new_contract_end_date',
        'old_base_salary', 'new_base_salary', 'old_daily_wage', 'new_daily_wage',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'old_contract_end_date' => 'date',
            'new_contract_end_date' => 'date',
            'old_base_salary' => 'decimal:2',
            'new_base_salary' => 'decimal:2',
            'old_daily_wage' => 'decimal:2',
            'new_daily_wage' => 'decimal:2',
        ];
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
