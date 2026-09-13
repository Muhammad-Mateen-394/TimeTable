<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TimetableEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function workload(Request $request)
    {
        $teachers = Teacher::where('school_id', $request->user()->school_id)->get();
        $counts = TimetableEntry::whereHas('timetable', fn ($q) => $q->where('school_id', $request->user()->school_id))->select('teacher_id', DB::raw('count(*) as assigned'))->groupBy('teacher_id')->pluck('assigned', 'teacher_id');
        return response()->json(['success' => true, 'data' => $teachers->map(fn ($teacher) => ['id' => $teacher->id, 'name' => $teacher->name, 'assigned' => (int) ($counts[$teacher->id] ?? 0), 'maximum' => $teacher->maximum_weekly_periods])->values()]);
    }

    public function subjects(Request $request)
    {
        $subjects = Subject::where('school_id', $request->user()->school_id)->get();
        return response()->json(['success' => true, 'data' => $subjects->map(fn ($subject) => ['name' => $subject->name, 'value' => $subject->default_weekly_periods])->values()]);
    }

    public function rooms(Request $request)
    {
        $rooms = Room::where('school_id', $request->user()->school_id)->get();
        $counts = TimetableEntry::whereHas('timetable', fn ($q) => $q->where('school_id', $request->user()->school_id))->select('room_id', DB::raw('count(*) as used'))->groupBy('room_id')->pluck('used', 'room_id');
        return response()->json(['success' => true, 'data' => $rooms->map(fn ($room) => ['id' => $room->id, 'name' => $room->name, 'used' => (int) ($counts[$room->id] ?? 0)])->values()]);
    }
}
