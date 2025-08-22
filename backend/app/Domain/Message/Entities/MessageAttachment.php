<?php

namespace App\Domain\Message\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Message;


class MessageAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'type',
        'title',
        'description',
        'url',
        'thumbnail_url',
        'author_name',
        'author_url',
        'provider_name',
        'provider_url',
        'metadata',
        'sort_order',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Relationships
    public function message()
    {
        return $this->belongsTo(App\Domain\Message\Entities\Message::class);
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeImages($query)
    {
        return $query->where('type', 'image');
    }

    public function scopeVideos($query)
    {
        return $query->where('type', 'video');
    }

    public function scopeFiles($query)
    {
        return $query->where('type', 'file');
    }

    public function scopeLinks($query)
    {
        return $query->where('type', 'link');
    }

    public function scopeEmbeds($query)
    {
        return $query->where('type', 'embed');
    }

    public function scopeByMessage($query, $messageId)
    {
        return $query->where('message_id', $messageId);
    }

    // Helper methods
    public function isImage()
    {
        return $this->type === 'image';
    }

    public function isVideo()
    {
        return $this->type === 'video';
    }

    public function isFile()
    {
        return $this->type === 'file';
    }

    public function isLink()
    {
        return $this->type === 'link';
    }

    public function isEmbed()
    {
        return $this->type === 'embed';
    }

    public function getDimensions()
    {
        return $this->metadata['dimensions'] ?? null;
    }

    public function getDuration()
    {
        return $this->metadata['duration'] ?? null;
    }

    public function getFileSize()
    {
        return $this->metadata['file_size'] ?? null;
    }
}
