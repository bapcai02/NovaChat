<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'conversation_id', 'channel_id', 'parent_id', 'content', 'type', 'metadata',
        'is_edited', 'edited_at', 'is_pinned', 'is_deleted', 'deleted_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_edited' => 'boolean',
        'is_pinned' => 'boolean',
        'is_deleted' => 'boolean',
        'edited_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function parent()
    {
        return $this->belongsTo(Message::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(Message::class, 'parent_id');
    }

    public function reactions()
    {
        return $this->hasMany(MessageReaction::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function reads()
    {
        return $this->hasMany(MessageRead::class);
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // When a new message is created, create read status entries for all conversation members
        static::created(function ($message) {
            MessageRead::createForNewMessage(
                $message->id,
                $message->conversation_id,
                $message->user_id
            );
        });
    }
}
