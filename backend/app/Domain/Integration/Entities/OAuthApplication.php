<?php

namespace App\Domain\Integration\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;


class OAuthApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'client_id',
        'client_secret',
        'redirect_uri',
        'scopes',
        'is_confidential',
        'is_active',
        'description',
        'website_url',
        'settings',
    ];

    protected $casts = [
        'scopes' => 'array',
        'is_confidential' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
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

    public function scopeConfidential($query)
    {
        return $query->where('is_confidential', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_confidential', false);
    }

    // Helper methods
    public function isConfidential()
    {
        return $this->is_confidential;
    }

    public function isPublic()
    {
        return !$this->is_confidential;
    }

    public function hasScope($scope)
    {
        return in_array($scope, $this->scopes ?? []);
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

    public function deactivate()
    {
        $this->update(['is_active' => false]);
    }

    public function activate()
    {
        $this->update(['is_active' => true]);
    }

    public function regenerateSecret()
    {
        $this->update([
            'client_secret' => \Illuminate\Support\Str::random(40),
        ]);
    }

    public function getRedirectUris()
    {
        return explode(',', $this->redirect_uri);
    }

    public function isValidRedirectUri($uri)
    {
        $allowedUris = $this->getRedirectUris();
        return in_array($uri, $allowedUris);
    }
}
