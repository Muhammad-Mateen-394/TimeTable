<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('campus')->nullable();
            $table->string('timezone')->default('Asia/Karachi');
            $table->json('settings')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->index(['school_id', 'role', 'status']);
        });

        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current')->default(false);
            $table->string('status')->default('active');
            $table->timestamps();
            $table->unique(['school_id', 'name']);
            $table->index(['school_id', 'is_current']);
        });

        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_code');
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('specialization')->nullable();
            $table->unsignedTinyInteger('maximum_daily_periods')->default(6);
            $table->unsignedSmallInteger('maximum_weekly_periods')->default(30);
            $table->string('status')->default('active');
            $table->timestamps();
            $table->unique(['school_id', 'employee_code']);
            $table->index(['school_id', 'status']);
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code');
            $table->unsignedTinyInteger('default_weekly_periods')->default(4);
            $table->boolean('requires_lab')->default(false);
            $table->boolean('requires_double_period')->default(false);
            $table->string('preferred_time')->nullable();
            $table->unsignedTinyInteger('priority')->default(5);
            $table->string('status')->default('active');
            $table->timestamps();
            $table->unique(['school_id', 'code']);
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code');
            $table->string('type')->default('classroom');
            $table->unsignedSmallInteger('capacity')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->unique(['school_id', 'code']);
        });

        Schema::create('school_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('day');
            $table->unsignedTinyInteger('day_number');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['school_id', 'day']);
        });

        Schema::create('periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedTinyInteger('period_number');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_break')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['school_id', 'period_number']);
        });

        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->string('grade');
            $table->string('section');
            $table->unsignedSmallInteger('student_count')->nullable();
            $table->foreignId('class_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->unique(['school_id', 'academic_year_id', 'grade', 'section']);
        });

        Schema::create('teaching_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('weekly_periods')->default(4);
            $table->unsignedTinyInteger('priority')->default(5);
            $table->string('status')->default('active');
            $table->timestamps();
            $table->index(['school_id', 'academic_year_id', 'class_id']);
        });

        Schema::create('teacher_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->foreignId('period_id')->constrained()->cascadeOnDelete();
            $table->string('day');
            $table->string('availability')->default('available');
            $table->string('preference')->nullable();
            $table->string('reason')->nullable();
            $table->timestamps();
            $table->unique(['teacher_id', 'day', 'period_id']);
        });

        Schema::create('timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('version')->default(1);
            $table->string('status')->default('draft');
            $table->unsignedTinyInteger('quality_score')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['school_id', 'academic_year_id', 'status']);
        });

        Schema::create('timetable_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('timetable_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assignment_id')->nullable()->constrained('teaching_assignments')->nullOnDelete();
            $table->string('day_of_week');
            $table->boolean('is_locked')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['timetable_id', 'day_of_week', 'period_id']);
            $table->index(['timetable_id', 'teacher_id', 'day_of_week', 'period_id'], 'tt_entry_teacher_slot_idx');
            $table->index(['timetable_id', 'room_id', 'day_of_week', 'period_id'], 'tt_entry_room_slot_idx');
            $table->unique(['timetable_id', 'class_id', 'day_of_week', 'period_id'], 'tt_entry_class_slot_uq');
        });

        Schema::create('conflicts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('timetable_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('severity')->default('high');
            $table->string('message');
            $table->json('details')->nullable();
            $table->string('status')->default('open');
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['school_id', 'status', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conflicts');
        Schema::dropIfExists('timetable_entries');
        Schema::dropIfExists('timetables');
        Schema::dropIfExists('teacher_availabilities');
        Schema::dropIfExists('teaching_assignments');
        Schema::dropIfExists('school_classes');
        Schema::dropIfExists('periods');
        Schema::dropIfExists('school_days');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('academic_years');
        Schema::table('users', fn (Blueprint $table) => $table->dropConstrainedForeignId('school_id'));
        Schema::dropIfExists('schools');
    }
};