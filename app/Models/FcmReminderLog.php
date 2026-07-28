<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FcmReminderLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['employee_id', 'attendance_date', 'type', 'sent_at'];

    protected function casts(): array
    {
        return ['attendance_date' => 'date', 'sent_at' => 'datetime'];
    }
}
