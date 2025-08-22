<?php

namespace App\Domain\User\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;


class UserStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'status_message',
        'last_seen_at',
    ];

    protected $casts = [
        'last_seen_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class);
    }

    // Scopes
    public function scopeOnline($query)
    {
        return $query->where('status', 'online');
    }

    public function scopeAway($query)
    {
        return $query->where('status', 'away');
    }

    public function scopeBusy($query)
    {
        return $query->where('status', 'busy');
    }

    public function scopeOffline($query)
    {
        return $query->where('status', 'offline');
    }
}
