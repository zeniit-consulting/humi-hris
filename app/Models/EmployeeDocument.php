<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDocument extends Model
{
    use BelongsToAccount;

    protected $fillable = [
        'user_id',
        'employee_id',
        'document_type',
        'document_number',
        'issued_at',
        'expires_at',
        'issuing_authority',
        'file_disk',
        'file_path',
        'file_original_name',
        'file_mime_type',
        'file_size',
        'verified_at',
        'verified_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
            'expires_at' => 'date',
            'verified_at' => 'datetime',
            'file_size' => 'integer',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function complianceStatus(): string
    {
        if (! $this->file_path) {
            return 'missing';
        }

        if ($this->expires_at?->isPast()) {
            return 'expired';
        }

        if ($this->expires_at && $this->expires_at->lte(now()->addDays(30))) {
            return 'expiring';
        }

        return 'valid';
    }
}
