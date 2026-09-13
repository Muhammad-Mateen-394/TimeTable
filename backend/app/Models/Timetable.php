<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timetable extends Model
{
    use HasFactory;
    protected $fillable = ['school_id', 'academic_year_id', 'name', 'version', 'status', 'quality_score', 'generated_at', 'submitted_at', 'approved_at', 'published_at', 'created_by', 'approved_by'];
    protected function casts(): array { return ['generated_at' => 'datetime', 'submitted_at' => 'datetime', 'approved_at' => 'datetime', 'published_at' => 'datetime']; }
    public function entries() { return $this->hasMany(TimetableEntry::class); }
    public function school() { return $this->belongsTo(School::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function approver() { return $this->belongsTo(User::class, 'approved_by'); }
}
