<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conflict extends Model
{
    use HasFactory;
    protected $fillable = ['school_id', 'timetable_id', 'type', 'severity', 'message', 'details', 'status', 'resolved_at', 'resolved_by'];
    protected function casts(): array { return ['details' => 'array', 'resolved_at' => 'datetime']; }
    public function timetable() { return $this->belongsTo(Timetable::class); }
}
