<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Webhook extends Model
{
    protected $fillable = [
        'url', 'event', 'secret', 'is_active', 'headers', 'config'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'headers' => 'array',
        'config' => 'array',
    ];
}


