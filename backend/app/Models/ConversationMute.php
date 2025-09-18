<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversationMute extends Model
{
    use HasFactory;

    protected $table = 'conversation_mutes';

    protected $fillable = [
        'conversation_id',
        'user_id',
        'muted_at',
    ];
}


