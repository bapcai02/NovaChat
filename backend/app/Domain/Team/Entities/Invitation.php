<?php

namespace App\Domain\Team\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;


class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'type',
        'invitable_id',
        'invitable_type',
        'invited_by',
        'email',
        'name',
        'role',
        'status',
        'expires_at',
        'accepted_at',
        'metadata',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function invitable()
    {
        return $this->morphTo();
    }

    public function invitedBy()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class, 'invited_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByEmail($query, $email)
    {
        return $query->where('email', $email);
    }

    // Helper methods
    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public function isPending()
    {
        return $this->status === 'pending' && !$this->isExpired();
    }

    public function accept()
    {
        $this->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }

    public function expire()
    {
        $this->update(['status' => 'expired']);
    }

    public function cancel()
    {
        $this->update(['status' => 'cancelled']);
    }
}
