<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;
    protected $fillable = ['school_id', 'user_id', 'employee_code', 'name', 'phone', 'specialization', 'maximum_daily_periods', 'maximum_weekly_periods', 'status'];
    public function school() { return $this->belongsTo(School::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function assignments() { return $this->hasMany(TeachingAssignment::class); }
    public function availabilities() { return $this->hasMany(TeacherAvailability::class); }
    public function timetableEntries() { return $this->hasMany(TimetableEntry::class); }
}
