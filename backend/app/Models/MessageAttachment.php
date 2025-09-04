<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageAttachment extends Model
{
    protected $table = 'message_attachments';

    protected $fillable = [
        'message_id', 'file_id', 'type', 'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];
}


