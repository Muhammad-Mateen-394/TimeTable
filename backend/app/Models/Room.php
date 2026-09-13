<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;
    protected $fillable = ['school_id', 'name', 'code', 'type', 'capacity', 'status'];
    public function school() { return $this->belongsTo(School::class); }
    public function timetableEntries() { return $this->hasMany(TimetableEntry::class); }
}
