<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageReaction extends Model
{
    protected $table = 'message_reactions';

    protected $fillable = [
        'message_id', 'user_id', 'emoji'
    ];
}


