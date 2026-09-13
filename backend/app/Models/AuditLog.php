<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = ['school_id', 'user_id', 'action', 'entity_type', 'entity_id', 'old_values', 'new_values', 'metadata', 'ip_address', 'user_agent'];
    protected function casts(): array { return ['old_values' => 'array', 'new_values' => 'array', 'metadata' => 'array']; }
}
