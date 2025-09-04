<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CallParticipant extends Model
{
    protected $table = 'call_participants';

    protected $fillable = [
        'call_id', 'user_id', 'role', 'joined_at', 'left_at'
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
    ];
}


