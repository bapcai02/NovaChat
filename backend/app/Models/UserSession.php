<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSession extends Model
{
    protected $table = 'user_sessions';

    protected $fillable = [
        'user_id', 'ip_address', 'user_agent', 'last_activity'
    ];

    protected $casts = [
        'last_activity' => 'datetime',
    ];
}


