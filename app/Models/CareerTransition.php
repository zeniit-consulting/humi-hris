<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CareerTransition extends Model
{
    use BelongsToAccount, HasFactory;

    public const TYPE_PROMOTION = 'promotion';
    public const TYPE_DEMOTION = 'demotion';
    public const TYPE_MUTATION = 'mutation';
    public const TYPE_ROTATION = 'rotation';
    public const TYPE_SALARY_ADJUSTMENT = 'salary_adjustment';
    public const TYPE_CONTRACT_CHANGE = 'contract_change';

    public const TRANSITION_TYPES = [
        self::TYPE_PROMOTION => 'Promosi Jabatan',
        self::TYPE_DEMOTION => 'Demosi Jabatan',
        self::TYPE_MUTATION => 'Mutasi Divisi/Cabang',
        self::TYPE_ROTATION => 'Rotasi Tugas',
        self::TYPE_SALARY_ADJUSTMENT => 'Penyesuaian Gaji',
        self::TYPE_CONTRACT_CHANGE => 'Perubahan Status Kerja',
    ];

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_APPLIED = 'applied';

    public const STATUSES = [
        self::STATUS_DRAFT => 'Draft',
        self::STATUS_PENDING => 'Menunggu Approval',
        self::STATUS_APPROVED => 'Disetujui (SK Terbit)',
        self::STATUS_REJECTED => 'Ditolak',
        self::STATUS_APPLIED => 'Telah Diterapkan',
    ];

    protected $fillable = [
        'user_id',
        'employee_id',
        'transition_number',
        'letter_number',
        'transition_type',
        'effective_date',
        'old_division_id',
        'old_division_name',
        'old_position_id',
        'old_position_name',
        'old_sub_company_id',
        'old_sub_company_name',
        'old_employment_status',
        'old_employment_type',
        'old_base_salary',
        'old_daily_wage',
        'new_division_id',
        'new_division_name',
        'new_position_id',
        'new_position_name',
        'new_sub_company_id',
        'new_sub_company_name',
        'new_employment_status',
        'new_employment_type',
        'new_base_salary',
        'new_daily_wage',
        'reason',
        'notes',
        'attachment_path',
        'attachment_name',
        'status',
        'approval_levels',
        'approval_stage',
        'first_approver_id',
        'first_approved_at',
        'first_approval_notes',
        'second_approver_id',
        'second_approved_at',
        'second_approval_notes',
        'rejected_by_user_id',
        'rejected_at',
        'rejection_reason',
        'created_by_user_id',
        'sk_generated_at',
        'sk_title',
        'sk_signer_name',
        'sk_signer_position',
        'sk_considerations',
        'sk_legal_basis',
        'sk_decision_points',
        'sk_document_path',
        'applied_at',
        'applied_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'first_approved_at' => 'datetime',
            'second_approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'sk_generated_at' => 'datetime',
            'applied_at' => 'datetime',
            'old_base_salary' => 'decimal:2',
            'new_base_salary' => 'decimal:2',
            'old_daily_wage' => 'decimal:2',
            'new_daily_wage' => 'decimal:2',
            'approval_levels' => 'integer',
            'approval_stage' => 'integer',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function oldDivision(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'old_division_id');
    }

    public function newDivision(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'new_division_id');
    }

    public function oldPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'old_position_id');
    }

    public function newPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'new_position_id');
    }

    public function oldSubCompany(): BelongsTo
    {
        return $this->belongsTo(SubCompany::class, 'old_sub_company_id');
    }

    public function newSubCompany(): BelongsTo
    {
        return $this->belongsTo(SubCompany::class, 'new_sub_company_id');
    }

    public function firstApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'first_approver_id');
    }

    public function secondApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'second_approver_id');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by_user_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function appliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applied_by_user_id');
    }
}
