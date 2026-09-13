<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherAvailability extends Model
{
    use HasFactory;
    protected $fillable = ['teacher_id', 'period_id', 'day', 'availability', 'preference', 'reason'];
    public function teacher() { return $this->belongsTo(Teacher::class); }
    public function period() { return $this->belongsTo(Period::class); }
}
