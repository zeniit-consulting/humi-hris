<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class ReimbursementRequest extends Model
{
    use BelongsToAccount, HasFactory;

    public const STATUSES = ['pending', 'approved', 'rejected', 'processing', 'paid'];
    public const CATEGORIES = ['Travels', 'Meals', 'Supplies', 'Others'];

    protected $fillable = [
        'user_id', 'employee_id', 'category', 'employee_bank_account_id',
        'bank_name', 'account_number', 'account_holder_name',
        'title', 'description', 'amount',
        'receipt_path', 'receipt_original_name', 'status', 'approved_by',
        'approved_at', 'rejection_reason', 'processed_by', 'processed_at',
        'finance_notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'approved_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(EmployeeBankAccount::class, 'employee_bank_account_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
