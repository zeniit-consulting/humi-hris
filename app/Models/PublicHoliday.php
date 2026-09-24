<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicHoliday extends Model
{
    /** @use HasFactory<\Database\Factories\PublicHolidayFactory> */
    use BelongsToAccount, HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'name',
        'holiday_type',
        'is_national_holiday',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'holiday_type' => 'string',
            'is_national_holiday' => 'boolean',
        ];
    }
}
