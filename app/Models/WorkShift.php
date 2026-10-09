<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkShift extends Model
{
    /** @use HasFactory<\Database\Factories\WorkShiftFactory> */
    use BelongsToAccount, HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'code',
        'name',
        'start_time',
        'end_time',
        'is_day_off',
        'is_wfa',
        'late_tolerance_minutes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_day_off' => 'boolean',
            'is_wfa' => 'boolean',
            'late_tolerance_minutes' => 'integer',
        ];
    }
}
