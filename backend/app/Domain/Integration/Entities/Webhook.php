<?php

namespace App\Domain\Integration\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Team\Entities\Team;
use App\Domain\Channel\Entities\Channel;


class Webhook extends Model
{
    use HasFactory;

    protected $fillable = [
        'channel_id',
        'team_id',
        'created_by',
        'name',
        'url',
        'secret',
        'events',
        'headers',
        'is_active',
        'failure_count',
        'last_triggered_at',
        'last_failure_at',
        'last_failure_reason',
    ];

    protected $casts = [
        'events' => 'array',
        'headers' => 'array',
        'is_active' => 'boolean',
        'last_triggered_at' => 'datetime',
        'last_failure_at' => 'datetime',
    ];

    // Relationships
    public function channel()
    {
        return $this->belongsTo(App\Domain\Channel\Entities\Channel::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByChannel($query, $channelId)
    {
        return $query->where('channel_id', $channelId);
    }

    public function scopeByTeam($query, $teamId)
    {
        return $query->where('team_id', $teamId);
    }

    public function scopeByEvent($query, $event)
    {
        return $query->whereJsonContains('events', $event);
    }

    // Helper methods
    public function shouldTriggerForEvent($event)
    {
        return $this->is_active && in_array($event, $this->events);
    }

    public function incrementFailureCount()
    {
        $this->increment('failure_count');
        $this->update([
            'last_failure_at' => now(),
        ]);
    }

    public function resetFailureCount()
    {
        $this->update([
            'failure_count' => 0,
            'last_failure_at' => null,
            'last_failure_reason' => null,
        ]);
    }

    public function markTriggered()
    {
        $this->update(['last_triggered_at' => now()]);
    }
}
