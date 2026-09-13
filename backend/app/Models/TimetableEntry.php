<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimetableEntry extends Model
{
    use HasFactory;
    protected $fillable = ['timetable_id', 'class_id', 'subject_id', 'teacher_id', 'room_id', 'period_id', 'assignment_id', 'day_of_week', 'is_locked', 'notes'];
    protected function casts(): array { return ['is_locked' => 'boolean']; }
    public function timetable() { return $this->belongsTo(Timetable::class); }
    public function schoolClass() { return $this->belongsTo(SchoolClass::class, 'class_id'); }
    public function subject() { return $this->belongsTo(Subject::class); }
    public function teacher() { return $this->belongsTo(Teacher::class); }
    public function room() { return $this->belongsTo(Room::class); }
    public function period() { return $this->belongsTo(Period::class); }
}
