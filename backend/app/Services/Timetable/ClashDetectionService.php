<?php

namespace App\Services\Timetable;

use App\Models\TeacherAvailability;
use App\Models\TimetableEntry;
use Illuminate\Support\Collection;

class ClashDetectionService
{
    public function forEntry(array $data, ?int $ignoreEntryId = null): Collection
    {
        $base = TimetableEntry::query()
            ->where('timetable_id', $data['timetable_id'])
            ->where('day_of_week', $data['day_of_week'])
            ->where('period_id', $data['period_id'])
            ->when($ignoreEntryId, fn ($query) => $query->whereKeyNot($ignoreEntryId));

        $conflicts = collect();
        if ((clone $base)->where('class_id', $data['class_id'])->exists()) {
            $conflicts->push($this->conflict('class_clash', 'The class already has a lesson during this period.'));
        }
        if ((clone $base)->where('teacher_id', $data['teacher_id'])->exists()) {
            $conflicts->push($this->conflict('teacher_clash', 'The teacher is already assigned during this period.'));
        }
        if (!empty($data['room_id']) && (clone $base)->where('room_id', $data['room_id'])->exists()) {
            $conflicts->push($this->conflict('room_clash', 'The room is already assigned during this period.'));
        }

        $unavailable = TeacherAvailability::query()
            ->where('teacher_id', $data['teacher_id'])
            ->where('period_id', $data['period_id'])
            ->where('day', $data['day_of_week'])
            ->where('availability', 'unavailable')
            ->exists();
        if ($unavailable) {
            $conflicts->push($this->conflict('availability_clash', 'The teacher is unavailable during this period.'));
        }
        return $conflicts;
    }

    private function conflict(string $type, string $message): array
    {
        return ['type' => $type, 'severity' => 'high', 'message' => $message];
    }
}
