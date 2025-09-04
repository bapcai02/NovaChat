<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SamlConfig extends Model
{
    protected $table = 'saml_configs';

    protected $fillable = [
        'team_id', 'idp_entity_id', 'idp_sso_url', 'idp_certificate', 'sp_entity_id', 'sp_acs_url', 'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];
}


