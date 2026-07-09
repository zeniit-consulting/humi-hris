<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeReprimand extends Model
{
    use BelongsToAccount;

    public const LEVELS = ['verbal', 'sp1', 'sp2', 'sp3'];

    public const STATUSES = ['active', 'resolved', 'void'];

    protected $fillable = [
        'user_id',
        'employee_id',
        'reprimand_number',
        'level',
        'issued_date',
        'incident_date',
        'subject',
        'description',
        'action_plan',
        'status',
        'resolution_notes',
    ];

    protected function casts(): array
    {
        return [
            'issued_date' => 'date',
            'incident_date' => 'date',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
