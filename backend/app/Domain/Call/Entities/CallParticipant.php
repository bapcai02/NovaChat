<?php

namespace App\Domain\Call\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Call\Entities\VoiceCall;


class CallParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'call_id',
        'user_id',
        'role',
        'status',
        'audio_enabled',
        'video_enabled',
        'screen_sharing',
        'joined_at',
        'left_at',
        'duration',
        'device_info',
        'connection_info',
    ];

    protected $casts = [
        'audio_enabled' => 'boolean',
        'video_enabled' => 'boolean',
        'screen_sharing' => 'boolean',
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
        'device_info' => 'array',
        'connection_info' => 'array',
    ];

    // Relationships
    public function call()
    {
        return $this->belongsTo(App\Domain\Call\Entities\VoiceCall::class, 'call_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'joined');
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeByCall($query, $callId)
    {
        return $query->where('call_id', $callId);
    }

    public function scopeWithAudio($query)
    {
        return $query->where('audio_enabled', true);
    }

    public function scopeWithVideo($query)
    {
        return $query->where('video_enabled', true);
    }

    public function scopeScreenSharing($query)
    {
        return $query->where('screen_sharing', true);
    }

    // Helper methods
    public function isHost()
    {
        return $this->role === 'host';
    }

    public function isActive()
    {
        return $this->status === 'joined';
    }

    public function hasLeft()
    {
        return $this->status === 'left';
    }

    public function getDurationInMinutes()
    {
        return $this->duration ? round($this->duration / 60, 2) : 0;
    }

    public function joinCall()
    {
        $this->update([
            'status' => 'joined',
            'joined_at' => now(),
        ]);
    }

    public function leaveCall()
    {
        $this->update([
            'status' => 'left',
            'left_at' => now(),
            'duration' => $this->joined_at ? now()->diffInSeconds($this->joined_at) : 0,
        ]);
    }

    public function toggleAudio()
    {
        $this->update(['audio_enabled' => !$this->audio_enabled]);
    }

    public function toggleVideo()
    {
        $this->update(['video_enabled' => !$this->video_enabled]);
    }

    public function toggleScreenShare()
    {
        $this->update(['screen_sharing' => !$this->screen_sharing]);
    }
}
