<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'name', 'type', 'team_id'
    ];

    protected $casts = [
        'team_id' => 'integer',
    ];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'conversation_members')
            ->withPivot('joined_at')
            ->withTimestamps();
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function getTitleAttribute()
    {
        if ($this->type === 'direct') {
            // For direct messages, return the other user's name
            $otherMember = $this->members()->where('user_id', '!=', auth()->id())->first();
            return $otherMember ? $otherMember->name : 'Direct Message';
        }
        
        return $this->name ?: ucfirst($this->type) . ' Chat';
    }
}


