<?php

namespace App\Domain\User\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;


class UserPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'key',
        'value',
        'category',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class);
    }

    // Scopes
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByKey($query, $key)
    {
        return $query->where('key', $key);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Helper methods
    public static function getValue($userId, $key, $default = null)
    {
        $preference = static::where('user_id', $userId)
            ->where('key', $key)
            ->first();
        
        return $preference ? $preference->value : $default;
    }

    public static function setValue($userId, $key, $value, $category = 'general')
    {
        return static::updateOrCreate(
            ['user_id' => $userId, 'key' => $key],
            ['value' => $value, 'category' => $category]
        );
    }

    public static function getPreferencesByCategory($userId, $category)
    {
        return static::where('user_id', $userId)
            ->where('category', $category)
            ->pluck('value', 'key')
            ->toArray();
    }

    public static function deletePreference($userId, $key)
    {
        return static::where('user_id', $userId)
            ->where('key', $key)
            ->delete();
    }
}
