<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChannelMember extends Model
{
    protected $table = 'channel_members';

    protected $fillable = [
        'channel_id', 'user_id', 'role', 'last_read_at'
    ];

    protected $casts = [
        'last_read_at' => 'datetime',
    ];
}


