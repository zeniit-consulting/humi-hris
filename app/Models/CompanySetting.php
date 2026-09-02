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
        'telegram_group_chat_id',
        'portal_kasbon_enabled',
        'employee_activation_otp_enabled',
        'show_sub_company_menu',
        'show_manpower_request_menu',
        'show_outsourcing_dashboard',
        'location_name',
        'location_address',
        'location_latitude',
        'location_longitude',
        'attendance_radius_meters',
        'require_face_recognition',
        'attendance_locations',
        'logo_path',
        'employee_code_prefix',
        'employee_code_digits',
        'employee_code_next_number',
        'overtime_hour_divisor',
        'overtime_calculation_mode',
        'overtime_rate_type',
        'overtime_fixed_rate_per_hour',
        'overtime_threshold_hours',
        'active_working_days',
        'auto_deduct_leave_for_missing_checkout',
        'missing_clock_out_request_days',
        'attendance_revision_cutoff_day',
        'overtime_multiplier_hour1',
        'overtime_multiplier_subsequent',
        'overtime_events',
        'auto_overtime_from_attendance',
        'auto_overtime_min_minutes',
        'bpjs_kesehatan_enabled',
        'bpjs_ketenagakerjaan_enabled',
        'bpjs_jkk_enabled',
        'bpjs_jkm_enabled',
        'bpjs_jht_enabled',
        'bpjs_jp_enabled',
        'bpjs_kesehatan_default_class',
        'private_insurance_enabled',
        'private_insurance_name',
        'private_insurance_nominal',
        'bpjs_kesehatan_wage_cap',
        'bpjs_jp_wage_cap',
        'bpjs_jkk_rate',
    ];

    protected function casts(): array
    {
        return [
            'location_latitude' => 'decimal:7',
            'location_longitude' => 'decimal:7',
            'attendance_radius_meters' => 'integer',
            'require_face_recognition' => 'boolean',
            'attendance_locations' => 'array',
            'portal_kasbon_enabled' => 'boolean',
            'employee_activation_otp_enabled' => 'boolean',
            'show_sub_company_menu' => 'boolean',
            'show_manpower_request_menu' => 'boolean',
            'show_outsourcing_dashboard' => 'boolean',
            'overtime_hour_divisor' => 'float',
            'overtime_threshold_hours' => 'integer',
            'overtime_fixed_rate_per_hour' => 'float',
            'active_working_days' => 'integer',
            'auto_deduct_leave_for_missing_checkout' => 'boolean',
            'missing_clock_out_request_days' => 'integer',
            'overtime_multiplier_hour1' => 'float',
            'overtime_multiplier_subsequent' => 'float',
            'overtime_events' => 'array',
            'auto_overtime_from_attendance' => 'boolean',
            'auto_overtime_min_minutes' => 'integer',
            'bpjs_kesehatan_enabled' => 'boolean',
            'bpjs_ketenagakerjaan_enabled' => 'boolean',
            'bpjs_jkk_enabled' => 'boolean',
            'bpjs_jkm_enabled' => 'boolean',
            'bpjs_jht_enabled' => 'boolean',
            'bpjs_jp_enabled' => 'boolean',
            'private_insurance_enabled' => 'boolean',
            'private_insurance_nominal' => 'decimal:2',
            'bpjs_kesehatan_wage_cap' => 'decimal:2',
            'bpjs_jp_wage_cap' => 'decimal:2',
            'bpjs_jkk_rate' => 'float',
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
