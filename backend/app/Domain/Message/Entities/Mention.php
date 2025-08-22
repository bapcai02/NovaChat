<?php

namespace App\Domain\Message\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Message\Entities\Message;


class Mention extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'mentioned_user_id',
        'mentioned_by_user_id',
        'type',
        'mention_text',
        'position',
        'is_notified',
        'notified_at',
    ];

    protected $casts = [
        'is_notified' => 'boolean',
        'notified_at' => 'datetime',
    ];

    // Relationships
    public function message()
    {
        return $this->belongsTo(App\Domain\Message\Entities\Message::class);
    }

    public function mentionedUser()
    {
        return $this->belongsTo(User::class, 'mentioned_user_id');
    }

    public function mentionedByUser()
    {
        return $this->belongsTo(User::class, 'mentioned_by_user_id');
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeNotified($query)
    {
        return $query->where('is_notified', true);
    }

    public function scopeNotNotified($query)
    {
        return $query->where('is_notified', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('mentioned_user_id', $userId);
    }

    public function scopeByMessage($query, $messageId)
    {
        return $query->where('message_id', $messageId);
    }

    // Helper methods
    public function markAsNotified()
    {
        $this->update([
            'is_notified' => true,
            'notified_at' => now(),
        ]);
    }

    public function isUserMention()
    {
        return $this->type === 'user';
    }

    public function isChannelMention()
    {
        return $this->type === 'channel';
    }

    public function isHereMention()
    {
        return $this->type === 'here';
    }

    public function isAllMention()
    {
        return $this->type === 'all';
    }
}
