<?php

namespace App\Domain\Channel\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use User;
use App\Domain\Team\Entities\Team;
use App\Domain\Channel\Entities\ChannelMember;
use App\Domain\Message\Entities\Message;
use App\Domain\File\Entities\FileShare;
use App\Domain\Call\Entities\VoiceCall;
use App\Domain\Team\Entities\Invitation;
use App\Domain\Integration\Entities\Webhook;
use App\Domain\Integration\Entities\Bot;


class Channel extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'name',
        'display_name',
        'description',
        'type',
        'is_archived',
        'is_read_only',
        'is_pinned',
        'is_featured',
        'is_verified',
        'avatar',
        'banner',
        'topic',
        'purpose',
        'permissions',
        'settings',
        'metadata',
        'member_count',
        'message_count',
        'last_message_at',
        'last_message_by',
        'created_by',
        'owner_id',
        'moderators',
        'rules',
        'tags',
        'category',
        'sort_order',
        'is_deleted',
        'deleted_at',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'is_read_only' => 'boolean',
        'is_pinned' => 'boolean',
        'is_featured' => 'boolean',
        'is_verified' => 'boolean',
        'permissions' => 'array',
        'settings' => 'array',
        'metadata' => 'array',
        'member_count' => 'integer',
        'message_count' => 'integer',
        'last_message_at' => 'datetime',
        'moderators' => 'array',
        'rules' => 'array',
        'tags' => 'array',
        'sort_order' => 'integer',
        'is_deleted' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class, 'created_by');
    }

    public function members()
    {
        return $this->hasMany(ChannelMember::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'channel_members');
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function webhooks()
    {
        return $this->hasMany(Webhook::class);
    }

    public function bots()
    {
        return $this->belongsToMany(Bot::class, 'bot_channels');
    }

    public function invitations()
    {
        return $this->morphMany(Invitation::class, 'invitable');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function lastMessageBy()
    {
        return $this->belongsTo(User::class, 'last_message_by');
    }

    public function voiceCalls()
    {
        return $this->hasMany(VoiceCall::class);
    }

    public function fileShares()
    {
        return $this->hasMany(FileShare::class);
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('type', 'public');
    }

    public function scopePrivate($query)
    {
        return $query->where('type', 'private');
    }

    public function scopeDirect($query)
    {
        return $query->where('type', 'direct');
    }

    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByTeam($query, $teamId)
    {
        return $query->where('team_id', $teamId);
    }

    public function scopeOrderByActivity($query)
    {
        return $query->orderBy('last_message_at', 'desc');
    }

    public function scopeOrderByMembers($query)
    {
        return $query->orderBy('member_count', 'desc');
    }

    // Helper methods
    public function isPublic()
    {
        return $this->type === 'public';
    }

    public function isPrivate()
    {
        return $this->type === 'private';
    }

    public function isDirect()
    {
        return $this->type === 'direct';
    }

    public function isAnnouncement()
    {
        return $this->type === 'announcement';
    }

    public function isSupport()
    {
        return $this->type === 'support';
    }

    public function isPinned()
    {
        return $this->is_pinned;
    }

    public function isFeatured()
    {
        return $this->is_featured;
    }

    public function isVerified()
    {
        return $this->is_verified;
    }

    public function isReadOnly()
    {
        return $this->is_read_only;
    }

    public function isArchived()
    {
        return $this->is_archived;
    }

    public function hasPermission($permission)
    {
        return in_array($permission, $this->permissions ?? []);
    }

    public function getModerators()
    {
        return User::whereIn('id', $this->moderators ?? [])->get();
    }

    public function isModerator($userId)
    {
        return in_array($userId, $this->moderators ?? []);
    }

    public function getRules()
    {
        return $this->rules ?? [];
    }

    public function getTags()
    {
        return $this->tags ?? [];
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

    public function getMetadata($key, $default = null)
    {
        return $this->metadata[$key] ?? $default;
    }

    public function setMetadata($key, $value)
    {
        $metadata = $this->metadata ?? [];
        $metadata[$key] = $value;
        $this->update(['metadata' => $metadata]);
    }

    public function incrementMessageCount()
    {
        $this->increment('message_count');
    }

    public function incrementMemberCount()
    {
        $this->increment('member_count');
    }

    public function decrementMemberCount()
    {
        $this->decrement('member_count');
    }

    public function updateLastMessage($messageId, $userId)
    {
        $this->update([
            'last_message_at' => now(),
            'last_message_by' => $userId,
        ]);
    }

    public function getAvatarUrl()
    {
        return $this->avatar ?: 'https://ui-avatars.com/api/?name=' . urlencode($this->display_name) . '&color=7C3AED&background=EBF4FF';
    }

    public function getBannerUrl()
    {
        return $this->banner;
    }
}
