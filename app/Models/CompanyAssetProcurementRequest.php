<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyAssetProcurementRequest extends Model
{
    use BelongsToAccount;

    protected $table = 'comp_ast_proc_requests';

    public const STATUSES = ['pending', 'approved', 'rejected', 'ordered', 'received', 'cancelled'];

    public const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

    protected $fillable = [
        'user_id',
        'requested_by_employee_id',
        'request_number',
        'item_name',
        'category',
        'quantity',
        'estimated_unit_price',
        'actual_unit_price',
        'needed_by',
        'priority',
        'status',
        'reason',
        'notes',
        'approved_at',
        'ordered_at',
        'received_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'estimated_unit_price' => 'decimal:2',
            'actual_unit_price' => 'decimal:2',
            'needed_by' => 'date',
            'approved_at' => 'datetime',
            'ordered_at' => 'datetime',
            'received_at' => 'datetime',
        ];
    }

    public function requestedByEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'requested_by_employee_id');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(CompanyAsset::class, 'procurement_request_id');
    }
}
