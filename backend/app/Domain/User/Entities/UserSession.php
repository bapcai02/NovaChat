<?php

namespace App\Domain\User\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;


class UserSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'ip_address',
        'user_agent',
        'device_info',
        'location_info',
        'last_activity_at',
        'is_active',
        'status',
        'expires_at',
        'metadata',
    ];

    protected $casts = [
        'device_info' => 'array',
        'location_info' => 'array',
        'metadata' => 'array',
        'last_activity_at' => 'datetime',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('last_activity_at', '>=', now()->subHours($hours));
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Helper methods
    public function isActive()
    {
        return $this->is_active && $this->status === 'active';
    }

    public function isExpired()
    {
        return $this->status === 'expired' || 
               ($this->expires_at && $this->expires_at->isPast());
    }

    public function isRevoked()
    {
        return $this->status === 'revoked';
    }

    public function updateActivity()
    {
        $this->update(['last_activity_at' => now()]);
    }

    public function revoke()
    {
        $this->update([
            'is_active' => false,
            'status' => 'revoked',
        ]);
    }

    public function expire()
    {
        $this->update([
            'is_active' => false,
            'status' => 'expired',
        ]);
    }

    public function getDeviceType()
    {
        return $this->device_info['type'] ?? 'unknown';
    }

    public function getBrowser()
    {
        return $this->device_info['browser'] ?? 'unknown';
    }

    public function getOS()
    {
        return $this->device_info['os'] ?? 'unknown';
    }

    public function getLocation()
    {
        return $this->location_info['city'] ?? 'Unknown';
    }

    public function getCountry()
    {
        return $this->location_info['country'] ?? 'Unknown';
    }
}
