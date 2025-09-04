<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutomationRule extends Model
{
    protected $table = 'automation_rules';

    protected $fillable = [
        'team_id', 'name', 'conditions', 'actions', 'is_active'
    ];

    protected $casts = [
        'conditions' => 'array',
        'actions' => 'array',
        'is_active' => 'boolean',
    ];
}


