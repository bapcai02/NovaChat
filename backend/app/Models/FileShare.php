<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileShare extends Model
{
    protected $table = 'file_shares';

    protected $fillable = [
        'file_id', 'shared_with_type', 'shared_with_id', 'permissions', 'expires_at'
    ];

    protected $casts = [
        'permissions' => 'array',
        'expires_at' => 'datetime',
    ];
}


