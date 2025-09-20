<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id', 'editor_id', 'action', 'old_content', 'new_content',
    ];
}
