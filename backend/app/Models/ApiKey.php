<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    protected $fillable = [
        'name', 'key', 'scopes', 'created_by', 'expires_at'
    ];

    protected $casts = [
        'scopes' => 'array',
        'expires_at' => 'datetime',
    ];
}


