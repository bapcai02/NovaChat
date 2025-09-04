<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageReport extends Model
{
    protected $table = 'message_reports';

    protected $fillable = [
        'message_id', 'reported_by', 'reason', 'status', 'moderator_id'
    ];
}


