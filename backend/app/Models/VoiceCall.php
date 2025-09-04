<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoiceCall extends Model
{
    protected $table = 'voice_calls';

    protected $fillable = [
        'initiator_id', 'channel_id', 'conversation_id', 'started_at', 'ended_at', 'metadata'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'metadata' => 'array',
    ];
}


