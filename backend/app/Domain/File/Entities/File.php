<?php

namespace App\Domain\File\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use User;
use App\Domain\Message\Entities\Message;


class File extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'message_id',
        'filename',
        'original_name',
        'mime_type',
        'size',
        'path',
        'disk',
        'metadata',
        'is_deleted',
    ];

    protected $casts = [
        'size' => 'integer',
        'metadata' => 'array',
        'is_deleted' => 'boolean',
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

    // Scopes
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

    public function scopeDocuments($query)
    {
        return $query->where('mime_type', 'like', 'application/%');
    }

    // Accessors
    public function getSizeInKbAttribute()
    {
        return round($this->size / 1024, 2);
    }

    public function getSizeInMbAttribute()
    {
        return round($this->size / (1024 * 1024), 2);
    }
}
