<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchIndex extends Model
{
    protected $table = 'search_indexes';

    protected $fillable = [
        'entity_type', 'entity_id', 'content', 'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];
}


