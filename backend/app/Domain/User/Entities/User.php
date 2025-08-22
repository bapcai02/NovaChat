<?php

namespace App\Domain\User\Entities;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Domain\Channel\Entities\Channel;
use App\Domain\Channel\Entities\ChannelMember;
use App\Domain\Message\Entities\Message;
use App\Domain\Message\Entities\MessageReaction;
use App\Domain\Message\Entities\DirectMessage;
use App\Domain\Message\Entities\Mention;
use App\Domain\File\Entities\File;
use App\Domain\User\Entities\UserStatus;
use App\Domain\Team\Entities\Team;
use App\Domain\Team\Entities\TeamMember;
use App\Domain\Notification\Entities\Notification;
use App\Domain\User\Entities\UserPreference;
use App\Domain\Integration\Entities\Bot;
use App\Domain\Team\Entities\Invitation;
use App\Domain\Security\Entities\AuditLog;
use App\Domain\Call\Entities\VoiceCall;
use App\Domain\Call\Entities\CallParticipant;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
        'bio',
        'phone',
        'timezone',
        'language',
        'status',
        'role',
        'permissions',
        'settings',
        'metadata',
        'last_login_at',
        'last_login_ip',

        'email_notifications',
        'push_notifications',
        'is_online',
        'last_seen_at',
        'status_message',
        'is_verified',
        'is_premium',
        'premium_expires_at',
        'social_links',
        'website',
        'location',
        'birth_date',
        'gender',
        'company',
        'job_title',
        'is_deleted',
        'deleted_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'permissions' => 'array',
        'settings' => 'array',
        'metadata' => 'array',
        'last_login_at' => 'datetime',
        'last_seen_at' => 'datetime',

        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'is_online' => 'boolean',
        'is_verified' => 'boolean',
        'is_premium' => 'boolean',
        'premium_expires_at' => 'datetime',
        'social_links' => 'array',
        'birth_date' => 'date',
        'is_deleted' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    // Chat-related relationships
    public function channels()
    {
        return $this->belongsToMany(Channel::class, 'channel_members');
    }

    public function channelMemberships()
    {
        return $this->hasMany(ChannelMember::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function messageReactions()
    {
        return $this->hasMany(MessageReaction::class);
    }

    public function sentDirectMessages()
    {
        return $this->hasMany(DirectMessage::class, 'sender_id');
    }

    public function receivedDirectMessages()
    {
        return $this->hasMany(DirectMessage::class, 'receiver_id');
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function status()
    {
        return $this->hasOne(UserStatus::class);
    }

    public function createdChannels()
    {
        return $this->hasMany(Channel::class, 'created_by');
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_members');
    }

    public function teamMemberships()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function preferences()
    {
        return $this->hasMany(UserPreference::class);
    }

    public function mentions()
    {
        return $this->hasMany(Mention::class, 'mentioned_user_id');
    }

    public function createdBots()
    {
        return $this->hasMany(Bot::class, 'created_by');
    }

    public function sentInvitations()
    {
        return $this->hasMany(Invitation::class, 'invited_by');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function voiceCalls()
    {
        return $this->hasMany(VoiceCall::class, 'initiator_id');
    }

    public function callParticipants()
    {
        return $this->hasMany(CallParticipant::class);
    }

    public function messageReports()
    {
        return $this->hasMany(App\Domain\Security\Entities\MessageReport::class, 'reported_by');
    }

    public function moderatedReports()
    {
        return $this->hasMany(App\Domain\Security\Entities\MessageReport::class, 'moderator_id');
    }

    public function sessions()
    {
        return $this->hasMany(App\Domain\User\Entities\UserSession::class);
    }

    public function fileShares()
    {
        return $this->hasMany(App\Domain\File\Entities\FileShare::class);
    }

    public function filePermissions()
    {
        return $this->hasMany(App\Domain\File\Entities\FilePermission::class);
    }

    public function analyticsEvents()
    {
        return $this->hasMany(App\Domain\Analytics\Entities\AnalyticsEvent::class);
    }

    public function apiKeys()
    {
        return $this->hasMany(App\Domain\Integration\Entities\ApiKey::class);
    }

    public function oauthApplications()
    {
        return $this->hasMany(App\Domain\Integration\Entities\OAuthApplication::class);
    }

    // Helper methods
    public function isOnline()
    {
        return $this->is_online;
    }

    public function isVerified()
    {
        return $this->is_verified;
    }

    public function isPremium()
    {
        return $this->is_premium && (!$this->premium_expires_at || $this->premium_expires_at->isFuture());
    }

    public function isPremiumExpired()
    {
        return $this->is_premium && $this->premium_expires_at && $this->premium_expires_at->isPast();
    }

    public function hasRole($role)
    {
        return $this->role === $role;
    }

    public function hasPermission($permission)
    {
        return in_array($permission, $this->permissions ?? []);
    }

    public function isSuperAdmin()
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin()
    {
        return in_array($this->role, ['super_admin', 'admin']);
    }

    public function isModerator()
    {
        return in_array($this->role, ['super_admin', 'admin', 'moderator']);
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isSuspended()
    {
        return $this->status === 'suspended';
    }

    public function isBanned()
    {
        return $this->status === 'banned';
    }



    public function updateLastSeen()
    {
        $this->update([
            'last_seen_at' => now(),
            'is_online' => true,
        ]);
    }

    public function markOffline()
    {
        $this->update(['is_online' => false]);
    }

    public function getDisplayName()
    {
        return $this->name;
    }

    public function getUsername()
    {
        return $this->username;
    }

    public function getMentionName()
    {
        return $this->username ? '@' . $this->username : $this->name;
    }

    public function getProfileUrl()
    {
        return $this->username ? '/user/' . $this->username : '/user/' . $this->id;
    }

    public function getAvatarUrl()
    {
        return $this->avatar ?: 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7C3AED&background=EBF4FF';
    }

    public function getAge()
    {
        return $this->birth_date ? $this->birth_date->age : null;
    }

    public function getSocialLink($platform)
    {
        return $this->social_links[$platform] ?? null;
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
    public function isMemberOf($channelId)
    {
        return $this->channelMemberships()->where('channel_id', $channelId)->exists();
    }

    public function getChannelRole($channelId)
    {
        $membership = $this->channelMemberships()->where('channel_id', $channelId)->first();
        return $membership ? $membership->role : null;
    }

    public function getUnreadMessageCount($channelId = null)
    {
        $query = $this->channelMemberships();
        if ($channelId) {
            $query->where('channel_id', $channelId);
        }
        return $query->whereNotNull('last_read_at')->count();
    }
}
