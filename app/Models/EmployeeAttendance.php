<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeAttendance extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeeAttendanceFactory> */
    use BelongsToAccount, HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'employee_id',
        'shift_id',
        'is_backup',
        'backup_for_employee_id',
        'backup_by_employee_id',
        'attendance_date',
        'timezone',
        'status',
        'late_minutes',
        'late_level',
        'late_penalty',
        'is_half_day',
        'check_in_at',
        'check_in_latitude',
        'check_in_longitude',
        'check_in_photo_url',
        'check_out_at',
        'check_out_latitude',
        'check_out_longitude',
        'check_out_photo_url',
        'face_similarity_score',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'is_backup' => 'boolean',
            'late_minutes' => 'integer',
            'late_penalty' => 'decimal:2',
            'is_half_day' => 'boolean',
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
            'check_in_latitude' => 'decimal:7',
            'check_in_longitude' => 'decimal:7',
            'check_out_latitude' => 'decimal:7',
            'check_out_longitude' => 'decimal:7',
            'face_similarity_score' => 'float',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get employee that owns this attendance row.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get employee being backed up.
     */
    public function backupForEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'backup_for_employee_id');
    }

    /**
     * Get employee performing the backup.
     */
    public function backupByEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'backup_by_employee_id');
    }

    /**
     * Get shift that owns this attendance row.
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(WorkShift::class);
    }
}
