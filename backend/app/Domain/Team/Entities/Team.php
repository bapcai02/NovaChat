<?php

namespace App\Domain\Team\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use User;
use App\Domain\Team\Entities\TeamMember;
use App\Domain\Channel\Entities\Channel;
use App\Domain\Team\Entities\Invitation;
use App\Domain\Integration\Entities\Webhook;


class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'avatar',
        'domain',
        'settings',
        'is_public',
        'is_archived',
        'owner_id',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_public' => 'boolean',
        'is_archived' => 'boolean',
    ];

    // Relationships
    public function owner()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class, 'owner_id');
    }

    public function members()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function channels()
    {
        return $this->hasMany(Channel::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'team_members');
    }

    public function webhooks()
    {
        return $this->hasMany(Webhook::class);
    }

    public function invitations()
    {
        return $this->morphMany(Invitation::class, 'invitable');
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }

    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    public function scopeByDomain($query, $domain)
    {
        return $query->where('domain', $domain);
    }

    // Helper methods
    public function isMember($userId)
    {
        return $this->members()->where('user_id', $userId)->exists();
    }

    public function getMemberRole($userId)
    {
        $member = $this->members()->where('user_id', $userId)->first();
        return $member ? $member->role : null;
    }

    public function getMemberCount()
    {
        return $this->members()->where('status', 'active')->count();
    }

    public function getChannelCount()
    {
        return $this->channels()->where('is_archived', false)->count();
    }
}
