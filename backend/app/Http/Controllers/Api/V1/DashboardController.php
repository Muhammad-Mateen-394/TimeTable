<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conflict;
use App\Models\Room;
use App\Models\SchoolClass;
use App\Models\Teacher;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $classes = SchoolClass::where('school_id', $schoolId)->get();
        $conflicts = Conflict::where('school_id', $schoolId)->where('status', 'open')->get();
        return response()->json(['success' => true, 'data' => [
            'classes' => $classes->count(), 'teachers' => Teacher::where('school_id', $schoolId)->count(),
            'rooms' => Room::where('school_id', $schoolId)->count(), 'active_conflicts' => $conflicts->count(),
            'completion' => $classes->count() ? (int) round($classes->where('status', 'complete')->count() / $classes->count() * 100) : 0,
            'conflicts' => $conflicts,
        ]]);
    }
}
