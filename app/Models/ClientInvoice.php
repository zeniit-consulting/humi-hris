<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientInvoice extends Model
{
    use BelongsToAccount;

    protected $fillable = [
        'user_id',
        'sub_company_id',
        'invoice_number',
        'period',
        'issued_at',
        'due_date',
        'status',
        'employee_count',
        'payroll_cost',
        'service_fee',
        'tax_amount',
        'total_amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
            'due_date' => 'date',
            'employee_count' => 'integer',
            'payroll_cost' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function subCompany(): BelongsTo
    {
        return $this->belongsTo(SubCompany::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ClientInvoiceItem::class);
    }
}
