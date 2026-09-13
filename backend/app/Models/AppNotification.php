<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppNotification extends Model
{
    protected $table = 'app_notifications';
    protected $fillable = ['school_id', 'user_id', 'type', 'title', 'message', 'read_at', 'data'];
    protected function casts(): array { return ['read_at' => 'datetime', 'data' => 'array']; }
}
