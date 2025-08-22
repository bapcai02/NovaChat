<?php

namespace App\Domain\Integration\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Channel\Entities\Channel;
use App\Domain\Integration\Entities\Bot;


class BotChannel extends Model
{
    use HasFactory;

    protected $fillable = [
        'bot_id',
        'channel_id',
        'permissions',
        'is_active',
        'added_by',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function bot()
    {
        return $this->belongsTo(App\Domain\Integration\Entities\Bot::class);
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class);
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByBot($query, $botId)
    {
        return $query->where('bot_id', $botId);
    }

    public function scopeByChannel($query, $channelId)
    {
        return $query->where('channel_id', $channelId);
    }

    // Helper methods
    public function hasPermission($permission)
    {
        return in_array($permission, $this->permissions ?? []);
    }

    public function addPermission($permission)
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->update(['permissions' => $permissions]);
        }
    }

    public function removePermission($permission)
    {
        $permissions = $this->permissions ?? [];
        $permissions = array_diff($permissions, [$permission]);
        $this->update(['permissions' => array_values($permissions)]);
    }
}
