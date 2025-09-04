<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Channel extends Model
{
    protected $fillable = [
        'name', 'display_name', 'description', 'is_private', 'created_by'
    ];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'channel_members');
    }
}


