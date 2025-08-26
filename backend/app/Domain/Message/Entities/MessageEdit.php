<?php

namespace App\Domain\Message\Entities;

use App\Domain\User\Entities\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Message\Entities\Message;


class MessageEdit extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'edited_by',
        'old_content',
        'new_content',
        'old_metadata',
        'new_metadata',
        'edit_reason',
    ];

    protected $casts = [
        'old_metadata' => 'array',
        'new_metadata' => 'array',
    ];

    // Relationships
    public function message()
    {
        return $this->belongsTo(App\Domain\Message\Entities\Message::class);
    }

    public function editedBy()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    // Scopes
    public function scopeByMessage($query, $messageId)
    {
        return $query->where('message_id', $messageId);
    }

    public function scopeByEditor($query, $userId)
    {
        return $query->where('edited_by', $userId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Helper methods
    public function getContentDiff()
    {
        return [
            'old' => $this->old_content,
            'new' => $this->new_content,
            'changed' => $this->old_content !== $this->new_content,
        ];
    }

    public function getMetadataDiff()
    {
        return [
            'old' => $this->old_metadata,
            'new' => $this->new_metadata,
            'changed' => $this->old_metadata !== $this->new_metadata,
        ];
    }

    public function hasContentChanged()
    {
        return $this->old_content !== $this->new_content;
    }

    public function hasMetadataChanged()
    {
        return $this->old_metadata !== $this->new_metadata;
    }
}
