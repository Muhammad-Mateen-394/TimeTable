<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;
    protected $fillable = ['school_id', 'name', 'code', 'default_weekly_periods', 'requires_lab', 'requires_double_period', 'preferred_time', 'priority', 'status'];
    protected function casts(): array { return ['requires_lab' => 'boolean', 'requires_double_period' => 'boolean']; }
    public function school() { return $this->belongsTo(School::class); }
    public function assignments() { return $this->hasMany(TeachingAssignment::class); }
}
