<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FilePermission extends Model
{
    protected $table = 'file_permissions';

    protected $fillable = [
        'file_id', 'user_id', 'permission'
    ];
}


