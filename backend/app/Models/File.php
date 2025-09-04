<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    protected $fillable = [
        'user_id', 'name', 'path', 'size', 'mime', 'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];
}


