<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password', 'avatar', 'status', 'status_message',
        'is_online', 'last_seen_at', 'role', 'bio', 'phone', 'timezone', 'language',
        'permissions', 'settings', 'metadata', 'last_login_at', 'last_login_ip',
        'email_notifications', 'push_notifications', 'is_verified', 'is_premium',
        'premium_expires_at', 'social_links', 'website', 'location', 'birth_date',
        'gender', 'company', 'job_title', 'is_deleted', 'deleted_at',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_online' => 'boolean',
        'last_seen_at' => 'datetime',
        'last_login_at' => 'datetime',
        'premium_expires_at' => 'datetime',
        'birth_date' => 'date',
        'deleted_at' => 'datetime',
        'permissions' => 'array',
        'settings' => 'array',
        'metadata' => 'array',
        'social_links' => 'array',
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'is_verified' => 'boolean',
        'is_premium' => 'boolean',
        'is_deleted' => 'boolean',
    ];

    // Relationships
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function channels()
    {
        return $this->belongsToMany(Channel::class, 'channel_members');
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_members');
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function reactions()
    {
        return $this->hasMany(MessageReaction::class);
    }

    /**
     * Get the full URL for the avatar.
     */
    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) {
            return null;
        }

        // If it's already a full URL, return as is
        if (filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            return $this->avatar;
        }

        // If it's a relative path, make it a full URL
        return url('storage/' . $this->avatar);
    }
}
