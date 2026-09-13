<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\Room;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeachingAssignment;
use App\Models\Timetable;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private function createSchedulerFixture(): array
    {
        $school = School::create(['name' => 'Test School', 'code' => 'TEST']);
        $principal = User::create(['school_id' => $school->id, 'name' => 'Principal', 'email' => 'principal@example.com', 'password' => Hash::make('secret123'), 'role' => 'principal']);
        $manager = User::create(['school_id' => $school->id, 'name' => 'Manager', 'email' => 'manager@example.com', 'password' => Hash::make('secret123'), 'role' => 'manager']);
        $teacherUser = User::create(['school_id' => $school->id, 'name' => 'Teacher', 'email' => 'teacher@example.com', 'password' => Hash::make('secret123'), 'role' => 'teacher']);
        $year = AcademicYear::create(['school_id' => $school->id, 'name' => '2025-26', 'start_date' => '2025-08-01', 'end_date' => '2026-06-30', 'is_current' => true]);
        $subject = Subject::create(['school_id' => $school->id, 'name' => 'Mathematics', 'code' => 'MTH']);
        $teacher = Teacher::create(['school_id' => $school->id, 'user_id' => $teacherUser->id, 'employee_code' => 'T1', 'name' => 'Teacher']);
        $room = Room::create(['school_id' => $school->id, 'name' => 'Room 1', 'code' => 'R1']);
        $class = SchoolClass::create(['school_id' => $school->id, 'academic_year_id' => $year->id, 'grade' => '9', 'section' => 'A']);
        $period = Period::create(['school_id' => $school->id, 'name' => 'P1', 'period_number' => 1, 'start_time' => '08:00', 'end_time' => '08:45']);
        TeachingAssignment::create(['school_id' => $school->id, 'academic_year_id' => $year->id, 'teacher_id' => $teacher->id, 'subject_id' => $subject->id, 'class_id' => $class->id, 'room_id' => $room->id, 'weekly_periods' => 1]);

        return compact('school', 'principal', 'manager', 'teacherUser', 'year');
    }

    public function test_principal_can_login_and_read_dashboard(): void
    {
        $school = School::create(['name' => 'Test School', 'code' => 'TEST']);
        User::create(['school_id' => $school->id, 'name' => 'Principal', 'email' => 'principal@example.com', 'password' => Hash::make('secret123'), 'role' => 'principal']);

        $response = $this->postJson('/api/v1/auth/login', ['email' => 'principal@example.com', 'password' => 'secret123']);

        $response->assertOk()->assertJsonPath('data.role', 'principal');
        $this->getJson('/api/v1/dashboard')->assertOk()->assertJsonPath('success', true);
    }

    public function test_teacher_cannot_create_timetable_entries(): void
    {
        $school = School::create(['name' => 'Test School', 'code' => 'TEST']);
        $teacher = User::create(['school_id' => $school->id, 'name' => 'Teacher', 'email' => 'teacher@example.com', 'password' => Hash::make('secret123'), 'role' => 'teacher']);
        $year = AcademicYear::create(['school_id' => $school->id, 'name' => '2025-26', 'start_date' => '2025-08-01', 'end_date' => '2026-06-30']);
        $timetable = Timetable::create(['school_id' => $school->id, 'academic_year_id' => $year->id, 'name' => 'Test', 'created_by' => $teacher->id]);

        $this->actingAs($teacher)->postJson("/api/v1/timetables/{$timetable->id}/entries", [])->assertForbidden();
    }

    public function test_manager_can_generate_a_quality_scored_timetable(): void
    {
        $manager = $this->createSchedulerFixture()['manager'];

        $response = $this->actingAs($manager)->postJson('/api/v1/timetables/generate');

        $response->assertCreated()->assertJsonPath('success', true)->assertJsonStructure(['data' => ['quality_score', 'entries_count']]);
    }

    public function test_manager_can_create_a_subject_but_teacher_cannot(): void
    {
        $fixture = $this->createSchedulerFixture();
        $manager = $fixture['manager'];
        $teacher = $fixture['teacherUser'];

        $this->actingAs($manager)->postJson('/api/v1/subjects', ['name' => 'Civics', 'code' => 'CIV', 'default_weekly_periods' => 2])->assertCreated();
        $this->actingAs($teacher)->postJson('/api/v1/subjects', ['name' => 'Unauthorized', 'code' => 'NO'])->assertForbidden();
        $this->assertDatabaseHas('subjects', ['code' => 'CIV']);
    }

    public function test_only_principal_can_approve_a_timetable(): void
    {
        $fixture = $this->createSchedulerFixture();
        $manager = $fixture['manager'];
        $timetable = Timetable::create(['school_id' => $fixture['school']->id, 'academic_year_id' => $fixture['year']->id, 'name' => 'Test timetable', 'created_by' => $manager->id]);
        $timetable->update(['status' => 'under_review']);

        $this->actingAs($manager)->postJson("/api/v1/timetables/{$timetable->id}/approve")->assertForbidden();
        $this->actingAs($fixture['principal'])->postJson("/api/v1/timetables/{$timetable->id}/approve")->assertOk()->assertJsonPath('data.status', 'approved');
    }

    public function test_manager_can_save_school_settings_and_create_an_academic_year(): void
    {
        $fixture = $this->createSchedulerFixture();

        $this->actingAs($fixture['manager'])->putJson('/api/v1/auth/school', [
            'name' => 'Updated Test School',
            'campus' => 'North Campus',
        ])->assertOk()->assertJsonPath('data.name', 'Updated Test School');

        $this->actingAs($fixture['manager'])->postJson('/api/v1/academic-years', [
            'name' => '2026-27',
            'start_date' => '2026-08-01',
            'end_date' => '2027-06-30',
            'is_current' => false,
        ])->assertCreated()->assertJsonPath('data.name', '2026-27');
    }

    public function test_new_school_can_sign_up_as_a_principal(): void
    {
        $response = $this->postJson('/api/v1/auth/signup', [
            'school_name' => 'New School',
            'campus' => 'Main',
            'name' => 'New Principal',
            'email' => 'principal@new-school.test',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertOk()->assertJsonPath('data.role', 'principal');
        $this->assertDatabaseHas('schools', ['name' => 'New School']);
        $this->assertDatabaseHas('users', ['email' => 'principal@new-school.test', 'role' => 'principal']);
    }
}
