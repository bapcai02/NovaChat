<?php

namespace App\Domain\Call\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Channel\Entities\Channel;
use App\Domain\Call\Entities\CallParticipant;


class VoiceCall extends Model
{
    use HasFactory;

    protected $fillable = [
        'channel_id',
        'initiator_id',
        'type',
        'status',
        'call_id',
        'participants',
        'recording_url',
        'started_at',
        'ended_at',
        'duration',
        'metadata',
    ];

    protected $casts = [
        'participants' => 'array',
        'metadata' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    // Relationships
    public function channel()
    {
        return $this->belongsTo(App\Domain\Channel\Entities\Channel::class);
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function participants()
    {
        return $this->hasMany(CallParticipant::class, 'call_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'call_participants', 'call_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByChannel($query, $channelId)
    {
        return $query->where('channel_id', $channelId);
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    // Helper methods
    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isEnded()
    {
        return in_array($this->status, ['ended', 'missed', 'declined']);
    }

    public function getParticipantCount()
    {
        return $this->participants()->where('status', 'joined')->count();
    }

    public function getDurationInMinutes()
    {
        return $this->duration ? round($this->duration / 60, 2) : 0;
    }

    public function endCall()
    {
        $this->update([
            'status' => 'ended',
            'ended_at' => now(),
            'duration' => $this->started_at ? now()->diffInSeconds($this->started_at) : 0,
        ]);
    }

    public function isVideoCall()
    {
        return $this->type === 'video';
    }

    public function isVoiceCall()
    {
        return $this->type === 'voice';
    }

    public function isScreenShare()
    {
        return $this->type === 'screen_share';
    }
}
