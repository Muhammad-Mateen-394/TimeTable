<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;
    protected $table = 'school_classes';
    protected $fillable = ['school_id', 'academic_year_id', 'grade', 'section', 'student_count', 'class_teacher_id', 'room_id', 'status'];
    public function school() { return $this->belongsTo(School::class); }
    public function academicYear() { return $this->belongsTo(AcademicYear::class); }
    public function classTeacher() { return $this->belongsTo(Teacher::class, 'class_teacher_id'); }
    public function room() { return $this->belongsTo(Room::class); }
    public function assignments() { return $this->hasMany(TeachingAssignment::class, 'class_id'); }
    public function timetableEntries() { return $this->hasMany(TimetableEntry::class, 'class_id'); }
}
