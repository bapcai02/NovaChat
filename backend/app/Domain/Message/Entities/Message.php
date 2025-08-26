<?php

namespace App\Domain\Message\Entities;

use App\Domain\User\Entities\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Domain\Channel\Entities\Channel;
use App\Domain\Message\Entities\Message;
use App\Domain\Message\Entities\MessageReaction;
use App\Domain\Message\Entities\MessageAttachment;
use App\Domain\Message\Entities\MessageEdit;
use App\Domain\Message\Entities\Mention;
use App\Domain\File\Entities\File;


class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'channel_id',
        'user_id',
        'parent_id',
        'content',
        'type',
        'metadata',
        'is_edited',
        'edited_at',
        'is_pinned',
        'is_deleted',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
        'is_pinned' => 'boolean',
        'is_deleted' => 'boolean',
    ];

    // Relationships
    public function channel()
    {
        return $this->belongsTo(App\Domain\Channel\Entities\Channel::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
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

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class);
    }

    public function edits()
    {
        return $this->hasMany(MessageEdit::class);
    }

    public function mentions()
    {
        return $this->hasMany(Mention::class);
    }

    // Scopes
    public function scopeByChannel($query, $channelId)
    {
        return $query->where('channel_id', $channelId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeNotDeleted($query)
    {
        return $query->where('is_deleted', false);
    }

    public function scopeThreadReplies($query)
    {
        return $query->whereNotNull('parent_id');
    }

    public function scopeMainMessages($query)
    {
        return $query->whereNull('parent_id');
    }
}
