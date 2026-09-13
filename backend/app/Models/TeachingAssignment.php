<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeachingAssignment extends Model
{
    use HasFactory;
    protected $fillable = ['school_id', 'academic_year_id', 'teacher_id', 'subject_id', 'class_id', 'room_id', 'weekly_periods', 'priority', 'status'];
    public function teacher() { return $this->belongsTo(Teacher::class); }
    public function subject() { return $this->belongsTo(Subject::class); }
    public function schoolClass() { return $this->belongsTo(SchoolClass::class, 'class_id'); }
    public function room() { return $this->belongsTo(Room::class); }
}
