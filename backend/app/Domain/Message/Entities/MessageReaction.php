<?php

namespace App\Domain\Message\Entities;

use App\Domain\User\Entities\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Message\Entities\Message;


class MessageReaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'user_id',
        'emoji',
    ];

    // Relationships
    public function message()
    {
        return $this->belongsTo(App\Domain\Message\Entities\Message::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByEmoji($query, $emoji)
    {
        return $query->where('emoji', $emoji);
    }

    public function scopeByMessage($query, $messageId)
    {
        return $query->where('message_id', $messageId);
    }
}
