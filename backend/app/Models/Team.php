<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = [
        'name', 'description', 'avatar', 'domain', 'settings', 'is_public', 'is_archived', 'created_by'
    ];

    public function members()
    {
        return $this->belongsToMany(User::class, 'team_members');
    }
}


