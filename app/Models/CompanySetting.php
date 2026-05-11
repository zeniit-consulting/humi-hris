<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    /** @use HasFactory<\Database\Factories\CompanySettingFactory> */
    use BelongsToAccount, HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'details',
        'location_name',
        'location_address',
        'location_latitude',
        'location_longitude',
        'attendance_radius_meters',
        'attendance_locations',
        'logo_path',
        'employee_code_prefix',
        'employee_code_digits',
        'employee_code_next_number',
        'overtime_hour_divisor',
        'overtime_multiplier_hour1',
        'overtime_multiplier_subsequent',
    ];

    protected function casts(): array
    {
        return [
            'location_latitude' => 'decimal:7',
            'location_longitude' => 'decimal:7',
            'attendance_radius_meters' => 'integer',
            'attendance_locations' => 'array',
            'overtime_hour_divisor' => 'float',
            'overtime_multiplier_hour1' => 'float',
            'overtime_multiplier_subsequent' => 'float',
        ];
    }
}
