<?php

namespace App\Domain\File\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Team\Entities\Team;
use App\Domain\File\Entities\FileShare;


class FilePermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_id',
        'user_id',
        'team_id',
        'permission',
        'expires_at',
        'is_active',
        'granted_by',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function file()
    {
        return $this->belongsTo(App\Domain\File\Entities\FileShare::class, 'file_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function grantedBy()
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByPermission($query, $permission)
    {
        return $query->where('permission', $permission);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByTeam($query, $teamId)
    {
        return $query->where('team_id', $teamId);
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
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

    public function canView()
    {
        return $this->permission === 'view' && $this->isActive();
    }

    public function canDownload()
    {
        return in_array($this->permission, ['download', 'edit', 'delete', 'share']) && $this->isActive();
    }

    public function canEdit()
    {
        return in_array($this->permission, ['edit', 'delete', 'share']) && $this->isActive();
    }

    public function canDelete()
    {
        return in_array($this->permission, ['delete', 'share']) && $this->isActive();
    }

    public function canShare()
    {
        return $this->permission === 'share' && $this->isActive();
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
}
