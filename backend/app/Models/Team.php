<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = [
        'name', 'description', 'slug', 'owner_id', 'is_private',
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'team_members')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }

    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function channels()
    {
        return $this->hasMany(Channel::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }
}
