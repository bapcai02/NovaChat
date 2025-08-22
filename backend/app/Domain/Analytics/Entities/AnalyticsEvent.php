<?php

namespace App\Domain\Analytics\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Team\Entities\Team;


class AnalyticsEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'team_id',
        'event_type',
        'event_category',
        'resource_id',
        'resource_type',
        'properties',
        'session_id',
        'ip_address',
        'user_agent',
        'context',
    ];

    protected $casts = [
        'properties' => 'array',
        'context' => 'array',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function resource()
    {
        return $this->morphTo('resource', 'resource_type', 'resource_id');
    }

    // Scopes
    public function scopeByType($query, $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('event_category', $category);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByTeam($query, $teamId)
    {
        return $query->where('team_id', $teamId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->where('created_at', '>=', now()->startOfWeek());
    }

    public function scopeThisMonth($query)
    {
        return $query->where('created_at', '>=', now()->startOfMonth());
    }

    // Helper methods
    public function getProperty($key, $default = null)
    {
        return $this->properties[$key] ?? $default;
    }

    public function getContext($key, $default = null)
    {
        return $this->context[$key] ?? $default;
    }

    public function isUserEvent()
    {
        return $this->event_category === 'user';
    }

    public function isMessageEvent()
    {
        return $this->event_category === 'message';
    }

    public function isFileEvent()
    {
        return $this->event_category === 'file';
    }

    public function isChannelEvent()
    {
        return $this->event_category === 'channel';
    }

    public function isCallEvent()
    {
        return $this->event_category === 'call';
    }

    // Static methods for common events
    public static function trackLogin($userId, $teamId = null, $context = [])
    {
        return static::create([
            'user_id' => $userId,
            'team_id' => $teamId,
            'event_type' => 'login',
            'event_category' => 'user',
            'context' => $context,
        ]);
    }

    public static function trackMessageSent($userId, $teamId, $messageId, $context = [])
    {
        return static::create([
            'user_id' => $userId,
            'team_id' => $teamId,
            'event_type' => 'message_sent',
            'event_category' => 'message',
            'resource_id' => $messageId,
            'resource_type' => 'Message',
            'context' => $context,
        ]);
    }

    public static function trackFileUpload($userId, $teamId, $fileId, $context = [])
    {
        return static::create([
            'user_id' => $userId,
            'team_id' => $teamId,
            'event_type' => 'file_uploaded',
            'event_category' => 'file',
            'resource_id' => $fileId,
            'resource_type' => 'FileShare',
            'context' => $context,
        ]);
    }

    public static function trackCallStarted($userId, $teamId, $callId, $context = [])
    {
        return static::create([
            'user_id' => $userId,
            'team_id' => $teamId,
            'event_type' => 'call_started',
            'event_category' => 'call',
            'resource_id' => $callId,
            'resource_type' => 'VoiceCall',
            'context' => $context,
        ]);
    }
}
