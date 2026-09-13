<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conflict;
use App\Models\Timetable;
use App\Models\TimetableEntry;
use App\Services\Timetable\ClashDetectionService;
use App\Services\Timetable\TimetableGenerationService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TimetableController extends Controller
{
    public function index(Request $request)
    {
        $data = Timetable::withCount('entries')->where('school_id', $request->user()->school_id)->latest()->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request, AuditService $audit)
    {
        abort_unless(in_array($request->user()->role, ['principal', 'manager'], true), 403);
        $schoolId = $request->user()->school_id;
        $data = $request->validate([
            'academic_year_id' => ['required', Rule::exists('academic_years', 'id')->where('school_id', $schoolId)],
            'name' => ['required', 'string', 'max:160'],
        ]);
        $timetable = Timetable::create([...$data, 'school_id' => $schoolId, 'created_by' => $request->user()->id, 'status' => 'draft']);
        $audit->record($request, 'timetable.created', 'Timetable', $timetable->id, [], $timetable->toArray());
        return response()->json(['success' => true, 'data' => $timetable], 201);
    }

    public function generate(Request $request, TimetableGenerationService $generator)
    {
        abort_unless(in_array($request->user()->role, ['principal', 'manager'], true), 403);
        $data = $request->validate(['academic_year_id' => ['nullable', Rule::exists('academic_years', 'id')->where('school_id', $request->user()->school_id)]]);
        $timetable = $generator->generate($request->user()->school_id, $request->user()->id, $data['academic_year_id'] ?? null);
        return response()->json(['success' => true, 'message' => 'Timetable generated successfully.', 'data' => [
            'timetable' => $timetable, 'quality_score' => $timetable->quality_score,
            'entries_count' => $timetable->entries->count(),
        ]], 201);
    }

    public function show(Request $request, Timetable $timetable)
    {
        $this->ensureSchool($request, $timetable);
        return response()->json(['success' => true, 'data' => $timetable->load('entries.subject', 'entries.teacher', 'entries.schoolClass', 'entries.room', 'entries.period')]);
    }

    public function validateEntry(Request $request, ClashDetectionService $detector)
    {
        $schoolId = $request->user()->school_id;
        $data = $request->validate([
            'timetable_id' => ['required', Rule::exists('timetables', 'id')->where('school_id', $schoolId)],
            'class_id' => ['required', Rule::exists('school_classes', 'id')->where('school_id', $schoolId)],
            'subject_id' => ['required', Rule::exists('subjects', 'id')->where('school_id', $schoolId)],
            'teacher_id' => ['required', Rule::exists('teachers', 'id')->where('school_id', $schoolId)],
            'room_id' => ['nullable', Rule::exists('rooms', 'id')->where('school_id', $schoolId)],
            'period_id' => ['required', Rule::exists('periods', 'id')->where('school_id', $schoolId)],
            'day_of_week' => ['required', 'string'], 'ignore_entry_id' => ['nullable', 'integer'],
        ]);
        $this->ensureSchool($request, Timetable::findOrFail($data['timetable_id']));
        $conflicts = $detector->forEntry($data, $data['ignore_entry_id'] ?? null);
        return response()->json(['success' => true, 'data' => ['valid' => $conflicts->isEmpty(), 'conflicts' => $conflicts->values()]]);
    }

    public function storeEntry(Request $request, Timetable $timetable, ClashDetectionService $detector, AuditService $audit)
    {
        $this->ensureSchool($request, $timetable);
        abort_unless(in_array($request->user()->role, ['principal', 'manager'], true), 403);
        $schoolId = $request->user()->school_id;
        $data = $request->validate([
            'class_id' => ['required', Rule::exists('school_classes', 'id')->where('school_id', $schoolId)],
            'subject_id' => ['required', Rule::exists('subjects', 'id')->where('school_id', $schoolId)],
            'teacher_id' => ['required', Rule::exists('teachers', 'id')->where('school_id', $schoolId)],
            'room_id' => ['nullable', Rule::exists('rooms', 'id')->where('school_id', $schoolId)],
            'period_id' => ['required', Rule::exists('periods', 'id')->where('school_id', $schoolId)],
            'day_of_week' => ['required', 'string'],
            'assignment_id' => ['nullable', Rule::exists('teaching_assignments', 'id')->where('school_id', $schoolId)],
            'is_locked' => ['boolean'], 'notes' => ['nullable', 'string'],
        ]);
        $conflicts = $detector->forEntry([...$data, 'timetable_id' => $timetable->id]);
        if ($conflicts->isNotEmpty()) return response()->json(['success' => false, 'message' => 'Timetable entry conflicts with existing assignments.', 'conflicts' => $conflicts->values()], 422);
        $entry = $timetable->entries()->create($data);
        $audit->record($request, 'timetable_entry.created', 'TimetableEntry', $entry->id, [], $entry->toArray());
        return response()->json(['success' => true, 'message' => 'Timetable entry created.', 'data' => $entry->load('subject', 'teacher', 'schoolClass', 'room', 'period')], 201);
    }

    public function updateEntry(Request $request, TimetableEntry $entry, ClashDetectionService $detector, AuditService $audit)
    {
        $this->ensureSchool($request, $entry->timetable);
        abort_unless(in_array($request->user()->role, ['principal', 'manager'], true), 403);
        abort_if($entry->is_locked, 422, 'This timetable entry is locked.');
        $schoolId = $request->user()->school_id;
        $data = $request->validate([
            'class_id' => ['sometimes', Rule::exists('school_classes', 'id')->where('school_id', $schoolId)],
            'subject_id' => ['sometimes', Rule::exists('subjects', 'id')->where('school_id', $schoolId)],
            'teacher_id' => ['sometimes', Rule::exists('teachers', 'id')->where('school_id', $schoolId)],
            'room_id' => ['nullable', Rule::exists('rooms', 'id')->where('school_id', $schoolId)],
            'period_id' => ['sometimes', Rule::exists('periods', 'id')->where('school_id', $schoolId)],
            'day_of_week' => ['sometimes', 'string'],
            'assignment_id' => ['nullable', Rule::exists('teaching_assignments', 'id')->where('school_id', $schoolId)],
            'is_locked' => ['boolean'], 'notes' => ['nullable', 'string'],
        ]);
        $candidate = [...$entry->only(['timetable_id', 'class_id', 'subject_id', 'teacher_id', 'room_id', 'period_id', 'day_of_week']), ...$data];
        $conflicts = $detector->forEntry($candidate, $entry->id);
        if ($conflicts->isNotEmpty()) return response()->json(['success' => false, 'message' => 'Timetable entry conflicts with existing assignments.', 'conflicts' => $conflicts->values()], 422);
        $old = $entry->toArray();
        $entry->update($data);
        $audit->record($request, 'timetable_entry.updated', 'TimetableEntry', $entry->id, $old, $entry->toArray());
        return response()->json(['success' => true, 'message' => 'Timetable entry updated.', 'data' => $entry->fresh()->load('subject', 'teacher', 'schoolClass', 'room', 'period')]);
    }

    public function destroyEntry(Request $request, TimetableEntry $entry, AuditService $audit)
    {
        $this->ensureSchool($request, $entry->timetable);
        abort_unless(in_array($request->user()->role, ['principal', 'manager'], true), 403);
        abort_if($entry->is_locked, 422, 'This timetable entry is locked.');
        $old = $entry->toArray();
        $entry->delete();
        $audit->record($request, 'timetable_entry.deleted', 'TimetableEntry', $entry->id, $old);
        return response()->json(['success' => true, 'message' => 'Timetable entry deleted.']);
    }

    public function submit(Request $request, Timetable $timetable, AuditService $audit)
    {
        $this->ensureSchool($request, $timetable);
        abort_unless($request->user()->role === 'manager', 403);
        abort_unless(in_array($timetable->status, ['draft', 'generated', 'changes_requested'], true), 422);
        $timetable->update(['status' => 'under_review', 'submitted_at' => now()]);
        $audit->record($request, 'timetable.submitted', 'Timetable', $timetable->id, [], $timetable->toArray());
        return response()->json(['success' => true, 'message' => 'Timetable submitted for approval.', 'data' => $timetable]);
    }

    public function requestChanges(Request $request, Timetable $timetable, AuditService $audit)
    {
        $this->ensureSchool($request, $timetable);
        abort_unless($request->user()->role === 'principal', 403);
        abort_unless($timetable->status === 'under_review', 422);
        $timetable->update(['status' => 'changes_requested']);
        $audit->record($request, 'timetable.changes_requested', 'Timetable', $timetable->id, [], $timetable->toArray());
        return response()->json(['success' => true, 'message' => 'Changes requested.', 'data' => $timetable]);
    }

    public function approve(Request $request, Timetable $timetable, AuditService $audit)
    {
        $this->ensureSchool($request, $timetable);
        abort_unless($request->user()->role === 'principal', 403);
        abort_unless($timetable->status === 'under_review', 422);
        $timetable->update(['status' => 'approved', 'approved_at' => now(), 'approved_by' => $request->user()->id]);
        $audit->record($request, 'timetable.approved', 'Timetable', $timetable->id, [], $timetable->toArray());
        return response()->json(['success' => true, 'message' => 'Timetable approved.', 'data' => $timetable]);
    }

    public function publish(Request $request, Timetable $timetable, AuditService $audit)
    {
        $this->ensureSchool($request, $timetable);
        abort_unless($request->user()->role === 'principal', 403);
        abort_unless($timetable->status === 'approved', 422);
        $timetable->update(['status' => 'published', 'published_at' => now()]);
        $audit->record($request, 'timetable.published', 'Timetable', $timetable->id, [], $timetable->toArray());
        return response()->json(['success' => true, 'message' => 'Timetable published.', 'data' => $timetable]);
    }

    private function ensureSchool(Request $request, Timetable $timetable): void
    {
        abort_unless($timetable->school_id === $request->user()->school_id, 404);
    }
}
