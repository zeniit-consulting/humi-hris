<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeClientVisit extends Model
{
    use BelongsToAccount;

    protected $fillable = [
        'user_id',
        'employee_id',
        'client_name',
        'work_description',
        'visit_date',
        'clock_in_at',
        'clock_in_latitude',
        'clock_in_longitude',
        'clock_out_at',
        'clock_out_latitude',
        'clock_out_longitude',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
            'clock_in_at' => 'datetime',
            'clock_in_latitude' => 'decimal:7',
            'clock_in_longitude' => 'decimal:7',
            'clock_out_at' => 'datetime',
            'clock_out_latitude' => 'decimal:7',
            'clock_out_longitude' => 'decimal:7',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
