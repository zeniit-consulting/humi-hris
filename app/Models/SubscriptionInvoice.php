<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class SubscriptionInvoice extends Model
{
    protected $fillable = [
        'user_id',
        'subscription_id',
        'invoice_number',
        'amount',
        'employee_count',
        'plan_slug',
        'status',
        'due_date',
        'paid_at',
        'payment_proof',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'employee_count' => 'integer',
            'due_date' => 'date',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public static function generateInvoiceNumber(int $userId): string
    {
        $date = Carbon::today()->format('Ymd');
        $random = str_pad((string) random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        return "INV-{$userId}-{$date}-{$random}";
    }
}
