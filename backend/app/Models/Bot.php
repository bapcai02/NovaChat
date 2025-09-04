<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bot extends Model
{
    protected $fillable = [
        'name', 'created_by', 'config'
    ];

    protected $casts = [
        'config' => 'array',
    ];
}


