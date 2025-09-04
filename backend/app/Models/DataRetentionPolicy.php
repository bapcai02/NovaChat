<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataRetentionPolicy extends Model
{
    protected $table = 'data_retention_policies';

    protected $fillable = [
        'team_id', 'name', 'rules', 'is_active'
    ];

    protected $casts = [
        'rules' => 'array',
        'is_active' => 'boolean',
    ];
}


