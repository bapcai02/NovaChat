<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'type', 'name', 'team_id', 'channel_id', 'metadata', 'is_pinned',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'conversation_members')
            ->withPivot(['joined_at', 'last_read_at'])
            ->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function conversationMembers()
    {
        return $this->hasMany(ConversationMember::class);
    }

    public function getTitleAttribute()
    {
        if ($this->type === 'direct') {
            $authId = auth()->id();
            if ($authId) {
                $otherMember = $this->members()->where('user_id', '!=', $authId)->first();

                return $otherMember ? $otherMember->name : 'Direct Message';
            }

            return 'Direct Message';
        }

        if ($this->type === 'channel' && $this->channel) {
            return $this->channel->name;
        }

        if ($this->type === 'team' && $this->team) {
            return $this->team->name;
        }

        return $this->name ?? 'Conversation';
    }
}
