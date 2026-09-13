<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'campus', 'timezone', 'settings', 'status'];

    protected function casts(): array
    {
        return ['settings' => 'array'];
    }

    public function users() { return $this->hasMany(User::class); }
    public function teachers() { return $this->hasMany(Teacher::class); }
    public function subjects() { return $this->hasMany(Subject::class); }
    public function rooms() { return $this->hasMany(Room::class); }
    public function classes() { return $this->hasMany(SchoolClass::class); }
    public function timetables() { return $this->hasMany(Timetable::class); }
}
