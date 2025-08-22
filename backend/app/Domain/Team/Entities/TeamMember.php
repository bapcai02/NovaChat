<?php

namespace App\Domain\Team\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Team\Entities\Team;


class TeamMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'user_id',
        'role',
        'status',
        'joined_at',
        'invited_at',
        'invited_by',
        'permissions',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'invited_at' => 'datetime',
        'permissions' => 'array',
    ];

    // Relationships
    public function team()
    {
        return $this->belongsTo(App\Domain\Team\Entities\Team::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    // Scopes
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInvited($query)
    {
        return $query->where('status', 'invited');
    }

    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }
}
