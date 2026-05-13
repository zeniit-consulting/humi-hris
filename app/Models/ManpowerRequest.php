<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManpowerRequest extends Model
{
    use BelongsToAccount;

    protected $fillable = [
        'user_id',
        'sub_company_id',
        'position_id',
        'job_vacancy_id',
        'request_number',
        'title',
        'requested_headcount',
        'fulfilled_headcount',
        'needed_by',
        'status',
        'priority',
        'requirements',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'requested_headcount' => 'integer',
            'fulfilled_headcount' => 'integer',
            'needed_by' => 'date',
        ];
    }

    public function subCompany(): BelongsTo
    {
        return $this->belongsTo(SubCompany::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function jobVacancy(): BelongsTo
    {
        return $this->belongsTo(JobVacancy::class);
    }
}
