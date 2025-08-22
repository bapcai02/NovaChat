<?php

namespace App\Domain\Integration\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;


class ApiKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'key_hash',
        'key_prefix',
        'permissions',
        'scopes',
        'last_used_at',
        'last_ip_address',
        'expires_at',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'permissions' => 'array',
        'scopes' => 'array',
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
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

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }

    public function scopeRecentlyUsed($query, $days = 30)
    {
        return $query->where('last_used_at', '>=', now()->subDays($days));
    }

    // Helper methods
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isActive()
    {
        return $this->is_active && !$this->isExpired();
    }

    public function hasPermission($permission)
    {
        return in_array($permission, $this->permissions ?? []);
    }

    public function hasScope($scope)
    {
        return in_array($scope, $this->scopes ?? []);
    }

    public function updateLastUsed($ipAddress = null)
    {
        $this->update([
            'last_used_at' => now(),
            'last_ip_address' => $ipAddress,
        ]);
    }

    public function revoke()
    {
        $this->update(['is_active' => false]);
    }

    public function extend($days)
    {
        $newExpiry = $this->expires_at ? $this->expires_at->addDays($days) : now()->addDays($days);
        $this->update(['expires_at' => $newExpiry]);
    }

    public function getDaysUntilExpiry()
    {
        if (!$this->expires_at) {
            return null;
        }
        return now()->diffInDays($this->expires_at, false);
    }

    public function getLastUsedDaysAgo()
    {
        if (!$this->last_used_at) {
            return null;
        }
        return now()->diffInDays($this->last_used_at);
    }
}
