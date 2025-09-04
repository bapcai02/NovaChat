<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamAnalytics extends Model
{
    protected $table = 'team_analytics';

    protected $fillable = [
        'team_id', 'metric', 'value', 'recorded_at'
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];
}


