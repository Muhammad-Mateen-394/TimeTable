<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\Room;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Timetable;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Regression test for the cross-school IDOR fix in MasterDataController and
 * TimetableController: a user from School A must not be able to reference
 * School B's teachers/rooms/subjects/classes/periods/assignments by ID,
 * even though the IDs are valid rows that simply belong to another tenant.
 */
class CrossSchoolIsolationTest extends TestCase
{
    use RefreshDatabase;

    private function makeSchoolWithManager(string $code): array
    {
        $school = School::create(['name' => "School {$code}", 'code' => $code]);
        $manager = User::create([
            'school_id' => $school->id,
            'name' => "Manager {$code}",
            'email' => strtolower($code) . '-manager@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'manager',
        ]);
        return [$school, $manager];
    }

    public function test_manager_cannot_reference_another_schools_academic_year_when_creating_a_class(): void
    {
        [$schoolA, $managerA] = $this->makeSchoolWithManager('A');
        [$schoolB] = $this->makeSchoolWithManager('B');

        $yearB = AcademicYear::create([
            'school_id' => $schoolB->id, 'name' => '2025-26',
            'start_date' => '2025-08-01', 'end_date' => '2026-06-30',
        ]);

        $response = $this->actingAs($managerA)->postJson('/api/v1/classes', [
            'academic_year_id' => $yearB->id, // belongs to School B
            'grade' => '9', 'section' => 'A',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('school_classes', ['school_id' => $schoolA->id]);
    }

    public function test_manager_cannot_attach_another_schools_teacher_room_or_subject_to_a_timetable_entry(): void
    {
        [$schoolA, $managerA] = $this->makeSchoolWithManager('A');
        [$schoolB] = $this->makeSchoolWithManager('B');

        $yearA = AcademicYear::create(['school_id' => $schoolA->id, 'name' => '2025-26', 'start_date' => '2025-08-01', 'end_date' => '2026-06-30']);
        $classA = SchoolClass::create(['school_id' => $schoolA->id, 'academic_year_id' => $yearA->id, 'grade' => '9', 'section' => 'A']);
        $subjectA = Subject::create(['school_id' => $schoolA->id, 'name' => 'Math', 'code' => 'MTH']);
        $periodA = Period::create(['school_id' => $schoolA->id, 'name' => 'P1', 'period_number' => 1, 'start_time' => '08:00', 'end_time' => '08:40']);
        $timetableA = Timetable::create(['school_id' => $schoolA->id, 'academic_year_id' => $yearA->id, 'name' => 'TT-A', 'created_by' => $managerA->id]);

        // Belongs to School B — this is the record School A should never be able to reference.
        $teacherB = Teacher::create(['school_id' => $schoolB->id, 'employee_code' => 'B-T1', 'name' => 'Teacher B']);
        $roomB = Room::create(['school_id' => $schoolB->id, 'name' => 'Room B1', 'code' => 'B1']);

        $response = $this->actingAs($managerA)->postJson("/api/v1/timetables/{$timetableA->id}/entries", [
            'class_id' => $classA->id,
            'subject_id' => $subjectA->id,
            'teacher_id' => $teacherB->id, // cross-school reference
            'room_id' => $roomB->id,        // cross-school reference
            'period_id' => $periodA->id,
            'day_of_week' => 'monday',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('timetable_entries', ['timetable_id' => $timetableA->id]);
    }
}
