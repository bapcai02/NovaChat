<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OAuthApplication extends Model
{
    protected $table = 'oauth_applications';

    protected $fillable = [
        'name', 'client_id', 'client_secret', 'redirect_uris', 'grants', 'created_by'
    ];

    protected $casts = [
        'redirect_uris' => 'array',
        'grants' => 'array',
    ];
}


