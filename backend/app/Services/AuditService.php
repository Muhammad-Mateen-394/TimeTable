<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\AppNotification;
use App\Models\User;
use Illuminate\Http\Request;

class AuditService
{
    public function record(Request $request, string $action, ?string $entityType = null, ?int $entityId = null, array $old = [], array $new = []): void
    {
        $user = $request->user();
        if (!$user?->school_id) return;
        AuditLog::create([
            'school_id' => $user->school_id, 'user_id' => $user->id, 'action' => $action,
            'entity_type' => $entityType, 'entity_id' => $entityId, 'old_values' => $old ?: null,
            'new_values' => $new ?: null, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(),
        ]);
        if (str_starts_with($action, 'timetable.')) {
            $message = $user->name.' changed the timetable ('.str_replace('timetable.', '', $action).').';
            User::where('school_id', $user->school_id)->whereIn('role', ['principal', 'manager'])->get()->each(
                fn (User $recipient) => AppNotification::create(['school_id' => $user->school_id, 'user_id' => $recipient->id, 'type' => 'timetable.changed', 'title' => 'Timetable changed', 'message' => $message, 'data' => ['actor' => $user->name, 'action' => $action, 'entity_id' => $entityId]])
            );
        }
    }
}
