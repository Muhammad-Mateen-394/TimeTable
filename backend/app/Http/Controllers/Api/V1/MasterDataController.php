<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\Room;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeachingAssignment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Services\AuditService;

class MasterDataController extends Controller
{
    private array $models = [
        'teachers' => Teacher::class, 'classes' => SchoolClass::class, 'subjects' => Subject::class,
        'rooms' => Room::class, 'periods' => Period::class, 'academic-years' => AcademicYear::class, 'assignments' => TeachingAssignment::class,
    ];

    public function index(Request $request, string $resource)
    {
        $schoolId = $request->user()->school_id;
        abort_unless(isset($this->models[$resource]), 404);
        $query = $this->models[$resource]::query()->where('school_id', $schoolId);
        if ($resource === 'classes') $query->with(['academicYear', 'classTeacher', 'room']);
        if ($resource === 'assignments') $query->with(['teacher', 'subject', 'schoolClass', 'room']);
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function store(Request $request, string $resource, AuditService $audit)
    {
        $this->authorizeWrite($request, $resource);
        $model = $this->models[$resource];
        $data = [...$this->validatedData($request, $resource), 'school_id' => $request->user()->school_id];
        $record = $model::create($data);
        $audit->record($request, $resource.'.created', $model, $record->id, [], $record->toArray());
        return response()->json(['success' => true, 'message' => 'Record created.', 'data' => $record], 201);
    }

    public function update(Request $request, string $resource, int $id, AuditService $audit)
    {
        $this->authorizeWrite($request, $resource);
        $model = $this->models[$resource];
        $record = $model::where('school_id', $request->user()->school_id)->findOrFail($id);
        $old = $record->toArray();
        $record->update($this->validatedData($request, $resource, true));
        $audit->record($request, $resource.'.updated', $model, $record->id, $old, $record->toArray());
        return response()->json(['success' => true, 'message' => 'Record updated.', 'data' => $record]);
    }

    public function destroy(Request $request, string $resource, int $id, AuditService $audit)
    {
        $this->authorizeWrite($request, $resource);
        $model = $this->models[$resource];
        $record = $model::where('school_id', $request->user()->school_id)->findOrFail($id);
        $record->delete();
        $audit->record($request, $resource.'.deleted', $model, $id);
        return response()->json(['success' => true, 'message' => 'Record deleted.']);
    }

    private function authorizeWrite(Request $request, string $resource): void
    {
        abort_unless(isset($this->models[$resource]), 404);
        abort_unless(in_array($request->user()->role, ['principal', 'manager'], true), 403);
    }

    private function validatedData(Request $request, string $resource, bool $partial = false): array
    {
        $required = fn () => $partial ? ['sometimes'] : ['required'];
        $schoolId = $request->user()->school_id;
        $rules = match ($resource) {
            'teachers' => ['name' => [...$required(), 'string', 'max:120'], 'employee_code' => [...$required(), 'string', 'max:40'], 'specialization' => ['nullable', 'string'], 'maximum_daily_periods' => ['nullable', 'integer', 'min:1', 'max:12'], 'maximum_weekly_periods' => ['nullable', 'integer', 'min:1', 'max:80'], 'status' => ['nullable', 'string']],
            'classes' => ['academic_year_id' => [...$required(), Rule::exists('academic_years', 'id')->where('school_id', $schoolId)], 'grade' => [...$required(), 'string'], 'section' => [...$required(), 'string'], 'student_count' => ['nullable', 'integer', 'min:0'], 'class_teacher_id' => ['nullable', Rule::exists('teachers', 'id')->where('school_id', $schoolId)], 'room_id' => ['nullable', Rule::exists('rooms', 'id')->where('school_id', $schoolId)], 'status' => ['nullable', 'string']],
            'subjects' => ['name' => [...$required(), 'string'], 'code' => [...$required(), 'string'], 'default_weekly_periods' => ['nullable', 'integer', 'min:1', 'max:20'], 'requires_lab' => ['nullable', 'boolean'], 'status' => ['nullable', 'string']],
            'rooms' => ['name' => [...$required(), 'string'], 'code' => [...$required(), 'string'], 'type' => ['nullable', 'string'], 'capacity' => ['nullable', 'integer', 'min:1'], 'status' => ['nullable', 'string']],
            'periods' => ['name' => [...$required(), 'string'], 'period_number' => [...$required(), 'integer', 'min:1', ...(!$partial ? [Rule::unique('periods', 'period_number')->where('school_id', $schoolId)] : [])], 'start_time' => [...$required(), 'date_format:H:i'], 'end_time' => [...$required(), 'date_format:H:i'], 'is_break' => ['nullable', 'boolean'], 'is_active' => ['nullable', 'boolean']],
            'academic-years' => ['name' => [...$required(), 'string'], 'start_date' => [...$required(), 'date'], 'end_date' => [...$required(), 'date', 'after_or_equal:start_date'], 'is_current' => ['nullable', 'boolean'], 'status' => ['nullable', 'string']],
            'assignments' => ['academic_year_id' => [...$required(), Rule::exists('academic_years', 'id')->where('school_id', $schoolId)], 'teacher_id' => [...$required(), Rule::exists('teachers', 'id')->where('school_id', $schoolId)], 'subject_id' => [...$required(), Rule::exists('subjects', 'id')->where('school_id', $schoolId)], 'class_id' => [...$required(), Rule::exists('school_classes', 'id')->where('school_id', $schoolId)], 'room_id' => ['nullable', Rule::exists('rooms', 'id')->where('school_id', $schoolId)], 'weekly_periods' => ['required', 'integer', 'min:1', 'max:20'], 'status' => ['nullable', 'string']],
        };
        return $request->validate($rules);
    }
}
