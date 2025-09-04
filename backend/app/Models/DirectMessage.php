<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DirectMessage extends Model
{
    protected $table = 'direct_messages';

    protected $fillable = [
        'sender_id', 'receiver_id', 'content', 'type', 'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];
}


