<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class Employee extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeeFactory> */
    use BelongsToAccount, HasFactory;

    public const EMPLOYMENT_TYPES = ['FL', 'PKWT', 'PKWTT', 'OS'];

    private static ?bool $hasCreatedByUserIdColumn = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'created_by_user_id',
        'sub_company_id',
        'attendance_location_ids',
        'is_wfa',
        'employee_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'gender',
        'birth_place',
        'birth_date',
        'last_education',
        'marital_status',
        'children_count',
        'hire_date',
        'offboarded_at',
        'offboarding_reason',
        'offboarding_notes',
        'employment_status',
        'employment_type',
        'contract_duration_months',
        'contract_end_date',
        'probation_duration_months',
        'probation_end_date',
        'pkwtt_activated_at',
        'pph21_method',
        'pph21_rate',
        'ptkp_category',
        'division_id',
        'position_id',
        'manager_id',
        'base_salary',
        'address',
        'domicile_address',
        'family_card_number',
        'ktp_number',
        'npwp_number',
        'blood_type',
        'religion',
        'bpjs_kesehatan_number',
        'bpjs_ketenagakerjaan_number',
        'sim_a_number',
        'sim_b_number',
        'sim_c_number',
        'biological_mother_name',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'notes',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'children_count' => 'integer',
            'hire_date' => 'date',
            'contract_duration_months' => 'integer',
            'contract_end_date' => 'date',
            'probation_duration_months' => 'integer',
            'probation_end_date' => 'date',
            'pkwtt_activated_at' => 'date',
            'offboarded_at' => 'date',
            'base_salary' => 'decimal:2',
            'pph21_rate' => 'decimal:2',
            'is_active' => 'boolean',
            'attendance_location_ids' => 'array',
            'is_wfa' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('sub_user_sub_company_records', function (Builder $builder): void {
            $user = Auth::user();

            if (! $user || ! $user->parent_user_id || $user->role === 'user') {
                return;
            }

            $subCompanyIds = $user->subCompanyScopeIds();

            if ($subCompanyIds === []) {
                $builder->whereRaw('1 = 0');

                return;
            }

            $builder->whereIn($builder->qualifyColumn('sub_company_id'), $subCompanyIds);
        });

        static::creating(function (Employee $employee): void {
            $user = Auth::user();

            if (! $user || ! self::hasCreatedByUserIdColumn() || $employee->created_by_user_id) {
                return;
            }

            $employee->created_by_user_id = $user->id;
        });
    }

    private static function hasCreatedByUserIdColumn(): bool
    {
        return self::$hasCreatedByUserIdColumn ??= Schema::hasColumn((new static)->getTable(), 'created_by_user_id');
    }

    /**
     * Get the division of this employee.
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function subCompany(): BelongsTo
    {
        return $this->belongsTo(SubCompany::class);
    }

    /**
     * Get the position of this employee.
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * Get the manager of this employee.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(self::class, 'manager_id');
    }

    /**
     * Get direct reports under this employee.
     */
    public function directReports(): HasMany
    {
        return $this->hasMany(self::class, 'manager_id');
    }

    /**
     * Get all bank accounts of this employee.
     */
    public function bankAccounts(): HasMany
    {
        return $this->hasMany(EmployeeBankAccount::class);
    }

    /**
     * Get attendance records of this employee.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(EmployeeAttendance::class);
    }

    /**
     * Get schedules assigned to this employee.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(EmployeeSchedule::class);
    }

    /**
     * Get leave requests of this employee.
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Get overtime requests of this employee.
     */
    public function overtimeRequests(): HasMany
    {
        return $this->hasMany(OvertimeRequest::class);
    }

    /**
     * Get allowance records of this employee.
     */
    public function allowances(): HasMany
    {
        return $this->hasMany(EmployeeAllowance::class);
    }

    /**
     * Get deduction records of this employee.
     */
    public function deductions(): HasMany
    {
        return $this->hasMany(EmployeeDeduction::class);
    }

    public function reprimands(): HasMany
    {
        return $this->hasMany(EmployeeReprimand::class);
    }

    /**
     * Get payroll items of this employee.
     */
    public function payrollItems(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }

    /**
     * Get asset assignment history for this employee.
     */
    public function assetAssignments(): HasMany
    {
        return $this->hasMany(CompanyAssetAssignment::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function employmentHistories(): HasMany
    {
        return $this->hasMany(EmployeeEmploymentHistory::class)->latest('effective_date')->latest('id');
    }

    public function performanceReviews(): HasMany
    {
        return $this->hasMany(PerformanceReview::class);
    }

    public function managedPerformanceReviews(): HasMany
    {
        return $this->hasMany(PerformanceReview::class, 'manager_id');
    }

    /**
     * Build a full name from first and last name.
     */
    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([$this->first_name, $this->last_name])));
    }
}
