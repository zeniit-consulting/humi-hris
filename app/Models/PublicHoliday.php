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
        'is_national_holiday',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_national_holiday' => 'boolean',
        ];
    }
}
