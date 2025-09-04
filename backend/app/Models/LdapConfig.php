<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LdapConfig extends Model
{
    protected $table = 'ldap_configs';

    protected $fillable = [
        'team_id', 'host', 'port', 'base_dn', 'username', 'password', 'use_ssl', 'use_tls', 'config'
    ];

    protected $casts = [
        'use_ssl' => 'boolean',
        'use_tls' => 'boolean',
        'config' => 'array',
    ];
}


