<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Period extends Model
{
    use HasFactory;
    protected $fillable = ['school_id', 'name', 'period_number', 'start_time', 'end_time', 'is_break', 'is_active'];
    protected function casts(): array { return ['is_break' => 'boolean', 'is_active' => 'boolean']; }
    public function school() { return $this->belongsTo(School::class); }
}
