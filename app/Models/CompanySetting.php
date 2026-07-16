<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use App\Models\User;
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
        'portal_kasbon_enabled',
        'employee_activation_otp_enabled',
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
            'portal_kasbon_enabled' => 'boolean',
            'employee_activation_otp_enabled' => 'boolean',
            'overtime_hour_divisor' => 'float',
            'overtime_multiplier_hour1' => 'float',
            'overtime_multiplier_subsequent' => 'float',
        ];
    }

    public static function portalKasbonEnabledFor(User $user): bool
    {
        $value = static::query()
            ->where('user_id', $user->accountOwnerId())
            ->value('portal_kasbon_enabled');

        return $value === null ? true : (bool) $value;
    }

    public static function employeeActivationOtpEnabledFor(User $user): bool
    {
        $value = static::query()
            ->where('user_id', $user->accountOwnerId())
            ->value('employee_activation_otp_enabled');

        return $value === null ? true : (bool) $value;
    }
}
