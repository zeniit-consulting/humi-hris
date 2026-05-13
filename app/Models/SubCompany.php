<?php

namespace App\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubCompany extends Model
{
    use BelongsToAccount, HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'name',
        'contact_person',
        'contact_phone',
        'contact_email',
        'address',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function attendanceLocations(): HasMany
    {
        return $this->hasMany(SubCompanyAttendanceLocation::class);
    }

    public function clientInvoices(): HasMany
    {
        return $this->hasMany(ClientInvoice::class);
    }

    public function manpowerRequests(): HasMany
    {
        return $this->hasMany(ManpowerRequest::class);
    }
}
