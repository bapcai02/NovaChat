<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageEdit extends Model
{
    protected $table = 'message_edits';

    protected $fillable = [
        'message_id', 'edited_by', 'old_content', 'new_content'
    ];
}


