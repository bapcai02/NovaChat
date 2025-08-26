<?php

namespace App\Domain\Channel\Entities;

use App\Domain\User\Entities\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Channel\Entities\Channel;


class ChannelMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'channel_id',
        'user_id',
        'role',
        'is_muted',
        'last_read_at',
        'preferences',
    ];

    protected $casts = [
        'is_muted' => 'boolean',
        'last_read_at' => 'datetime',
        'preferences' => 'array',
    ];

    // Relationships
    public function channel()
    {
        return $this->belongsTo(App\Domain\Channel\Entities\Channel::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeActive($query)
    {
        return $query->where('is_muted', false);
    }
}
