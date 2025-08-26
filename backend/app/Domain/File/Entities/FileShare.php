<?php

namespace App\Domain\File\Entities;

use App\Domain\User\Entities\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use User;
use App\Domain\Team\Entities\Team;
use App\Domain\Channel\Entities\Channel;
use App\Domain\Message\Entities\Message;
use App\Domain\File\Entities\FilePermission;


class FileShare extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'message_id',
        'channel_id',
        'team_id',
        'filename',
        'original_name',
        'mime_type',
        'size',
        'path',
        'disk',
        'is_public',
        'download_count',
        'expires_at',
        'password_protected',
        'password_hash',
        'preview_url',
        'thumbnail_url',
        'metadata',
        'is_deleted',
    ];

    protected $casts = [
        'size' => 'integer',
        'download_count' => 'integer',
        'is_public' => 'boolean',
        'password_protected' => 'boolean',
        'is_deleted' => 'boolean',
        'metadata' => 'array',
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class);
    }

    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function permissions()
    {
        return $this->hasMany(FilePermission::class, 'file_id');
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, $mimeType)
    {
        return $query->where('mime_type', 'like', $mimeType . '%');
    }

    public function scopeImages($query)
    {
        return $query->where('mime_type', 'like', 'image/%');
    }

    public function scopeVideos($query)
    {
        return $query->where('mime_type', 'like', 'video/%');
    }

    public function scopeDocuments($query)
    {
        return $query->where('mime_type', 'like', 'application/%');
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')->where('expires_at', '<', now());
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }

    // Helper methods
    public function getSizeInKbAttribute()
    {
        return round($this->size / 1024, 2);
    }

    public function getSizeInMbAttribute()
    {
        return round($this->size / (1024 * 1024), 2);
    }

    public function getSizeInGbAttribute()
    {
        return round($this->size / (1024 * 1024 * 1024), 2);
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isImage()
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    public function isVideo()
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    public function isAudio()
    {
        return str_starts_with($this->mime_type, 'audio/');
    }

    public function isDocument()
    {
        return str_starts_with($this->mime_type, 'application/');
    }

    public function incrementDownloadCount()
    {
        $this->increment('download_count');
    }

    public function getDimensions()
    {
        return $this->metadata['dimensions'] ?? null;
    }

    public function getDuration()
    {
        return $this->metadata['duration'] ?? null;
    }

    public function hasPermission($userId, $permission = 'view')
    {
        if ($this->is_public) {
            return true;
        }

        if ($this->user_id === $userId) {
            return true;
        }

        return $this->permissions()
            ->where('user_id', $userId)
            ->where('permission', $permission)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();
    }
}
