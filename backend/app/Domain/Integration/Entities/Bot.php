<?php

namespace App\Domain\Integration\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Channel\Entities\Channel;
use App\Domain\Integration\Entities\BotChannel;


class Bot extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'name',
        'username',
        'description',
        'avatar',
        'webhook_url',
        'api_token',
        'capabilities',
        'settings',
        'is_active',
        'last_activity_at',
    ];

    protected $casts = [
        'capabilities' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'last_activity_at' => 'datetime',
    ];

    protected $hidden = [
        'api_token',
    ];

    // Relationships
    public function createdBy()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class, 'created_by');
    }

    public function channels()
    {
        return $this->hasMany(BotChannel::class);
    }

    public function accessibleChannels()
    {
        return $this->belongsToMany(Channel::class, 'bot_channels');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByUsername($query, $username)
    {
        return $query->where('username', $username);
    }

    public function scopeByCreator($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeRecentlyActive($query, $hours = 24)
    {
        return $query->where('last_activity_at', '>=', now()->subHours($hours));
    }

    // Helper methods
    public function hasCapability($capability)
    {
        return in_array($capability, $this->capabilities ?? []);
    }

    public function canAccessChannel($channelId)
    {
        return $this->channels()->where('channel_id', $channelId)->exists();
    }

    public function getChannelPermissions($channelId)
    {
        $botChannel = $this->channels()->where('channel_id', $channelId)->first();
        return $botChannel ? $botChannel->permissions : [];
    }

    public function updateActivity()
    {
        $this->update(['last_activity_at' => now()]);
    }

    public function generateApiToken()
    {
        $this->update(['api_token' => \Str::random(64)]);
        return $this->api_token;
    }

    public function getSetting($key, $default = null)
    {
        return $this->settings[$key] ?? $default;
    }

    public function setSetting($key, $value)
    {
        $settings = $this->settings ?? [];
        $settings[$key] = $value;
        $this->update(['settings' => $settings]);
    }
}
