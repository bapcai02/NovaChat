<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserStatus extends Model
{
    protected $table = 'user_statuses';

    protected $fillable = [
        'user_id', 'status', 'status_message', 'last_seen_at'
    ];

    protected $casts = [
        'last_seen_at' => 'datetime',
    ];
}


