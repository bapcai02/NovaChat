<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BotChannel extends Model
{
    protected $table = 'bot_channels';

    protected $fillable = [
        'bot_id', 'channel_id'
    ];
}


