<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conflict;
use App\Services\AuditService;
use Illuminate\Http\Request;

class ConflictController extends Controller
{
    public function index(Request $request)
    {
        $query = Conflict::where('school_id', $request->user()->school_id)->latest();
        foreach (['status', 'type', 'severity'] as $filter) if ($request->filled($filter)) $query->where($filter, $request->string($filter));
        return response()->json(['success' => true, 'data' => $query->paginate(50)]);
    }

    public function resolve(Request $request, Conflict $conflict, AuditService $audit)
    {
        abort_unless($conflict->school_id === $request->user()->school_id, 404);
        abort_unless(in_array($request->user()->role, ['principal', 'manager'], true), 403);
        $old = $conflict->toArray();
        $conflict->update(['status' => $request->input('method') === 'ignore' ? 'ignored' : 'resolved', 'resolved_at' => now(), 'resolved_by' => $request->user()->id]);
        $audit->record($request, 'conflict_resolved', 'Conflict', $conflict->id, $old, $conflict->toArray());
        return response()->json(['success' => true, 'message' => 'Conflict updated.', 'data' => $conflict]);
    }
}
