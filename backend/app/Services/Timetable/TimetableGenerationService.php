<?php

namespace App\Services\Timetable;

use App\Models\AcademicYear;
use App\Models\TeachingAssignment;
use App\Models\Timetable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TimetableGenerationService
{
    public function generate(int $schoolId, int $userId, ?int $academicYearId = null): Timetable
    {
        return DB::transaction(function () use ($schoolId, $userId, $academicYearId) {
            $year = AcademicYear::query()->where('school_id', $schoolId)->when($academicYearId, fn ($q) => $q->whereKey($academicYearId))->when(!$academicYearId, fn ($q) => $q->where('is_current', true))->firstOrFail();
            $assignments = TeachingAssignment::with(['subject', 'teacher', 'room'])->where('school_id', $schoolId)->where('academic_year_id', $year->id)->where('status', 'active')->get();
            $periods = DB::table('periods')->where('school_id', $schoolId)->where('is_active', true)->where('is_break', false)->orderBy('period_number')->get();
            if ($assignments->isEmpty()) throw new RuntimeException('Create at least one active assignment for this academic year before generation.');
            if ($periods->isEmpty()) throw new RuntimeException('Create at least one active teaching period before generation.');

            $timetable = Timetable::create(['school_id' => $schoolId, 'academic_year_id' => $year->id, 'name' => 'Generated timetable '.$year->name, 'status' => 'generated', 'generated_at' => now(), 'created_by' => $userId]);
            $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            $used = ['class' => [], 'teacher' => [], 'room' => []];
            $scheduled = 0;
            foreach ($assignments as $assignment) {
                for ($lesson = 0; $lesson < $assignment->weekly_periods; $lesson++) {
                    $placed = false;
                    foreach ($days as $day) foreach ($periods as $period) {
                        $keys = [
                            'class' => $assignment->class_id.'|'.$day.'|'.$period->id,
                            'teacher' => $assignment->teacher_id.'|'.$day.'|'.$period->id,
                            'room' => ($assignment->room_id ?? 'none').'|'.$day.'|'.$period->id,
                        ];
                        if (isset($used['class'][$keys['class']]) || isset($used['teacher'][$keys['teacher']]) || ($assignment->room_id && isset($used['room'][$keys['room']]))) continue;
                        $timetable->entries()->create(['class_id' => $assignment->class_id, 'subject_id' => $assignment->subject_id, 'teacher_id' => $assignment->teacher_id, 'room_id' => $assignment->room_id, 'period_id' => $period->id, 'assignment_id' => $assignment->id, 'day_of_week' => $day]);
                        foreach ($keys as $type => $key) $used[$type][$key] = true;
                        $scheduled++;
                        $placed = true;
                        break 2;
                    }
                    if (!$placed) break;
                }
            }
            $required = $assignments->sum('weekly_periods');
            $score = $required ? (int) floor(($scheduled / $required) * 100) : 0;
            $timetable->update(['quality_score' => $score]);
            return $timetable->load('entries');
        });
    }
}
