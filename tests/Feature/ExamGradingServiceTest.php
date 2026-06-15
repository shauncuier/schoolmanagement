<?php

use App\Models\AcademicYear;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ExamSchedule;
use App\Models\ReportCard;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Tenant;
use App\Models\User;
use App\Services\Exam\ExamGradingService;
use App\Services\Exam\GradingService;
use Illuminate\Support\Facades\DB;

function gradingTenant(): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => 'grading-school'],
        ['name' => 'Grading School', 'slug' => 'grading-school', 'email' => 'g@school.test', 'status' => 'active', 'subscription_plan' => 'free']
    );
}

function examStudent(Tenant $t, AcademicYear $y, SchoolClass $c, Section $s, string $roll, string $name): Student
{
    $user = User::factory()->create(['tenant_id' => $t->id, 'name' => $name]);

    return Student::create([
        'tenant_id' => $t->id, 'user_id' => $user->id, 'academic_year_id' => $y->id,
        'class_id' => $c->id, 'section_id' => $s->id, 'roll_number' => $roll, 'status' => 'active',
    ]);
}

function examEnv(): array
{
    $t = gradingTenant();
    $year = AcademicYear::create([
        'tenant_id' => $t->id, 'name' => '2025-2026', 'start_date' => '2025-01-01',
        'end_date' => '2025-12-31', 'is_current' => true, 'status' => 'active',
    ]);
    $class = SchoolClass::create(['tenant_id' => $t->id, 'name' => 'Grade 6']);
    $section = Section::create(['tenant_id' => $t->id, 'class_id' => $class->id, 'academic_year_id' => $year->id, 'name' => 'A']);
    $examTypeId = DB::table('exam_types')->insertGetId([
        'tenant_id' => $t->id, 'name' => 'Final', 'weightage' => 100, 'is_active' => true,
        'created_at' => now(), 'updated_at' => now(),
    ]);
    $exam = Exam::create([
        'tenant_id' => $t->id, 'name' => 'Final 2025', 'exam_type_id' => $examTypeId,
        'academic_year_id' => $year->id, 'start_date' => '2025-11-01', 'end_date' => '2025-11-10', 'status' => 'ongoing',
    ]);
    $math = Subject::create(['tenant_id' => $t->id, 'name' => 'Math']);
    $eng = Subject::create(['tenant_id' => $t->id, 'name' => 'English']);
    $sched = fn (Subject $sub) => ExamSchedule::create([
        'tenant_id' => $t->id, 'exam_id' => $exam->id, 'class_id' => $class->id, 'section_id' => $section->id,
        'subject_id' => $sub->id, 'date' => '2025-11-01', 'start_time' => '10:00', 'end_time' => '12:00',
        'full_marks' => 100, 'pass_marks' => 33,
    ]);

    return [
        't' => $t, 'exam' => $exam,
        'math' => $sched($math), 'eng' => $sched($eng),
        's1' => examStudent($t, $year, $class, $section, '1', 'Alice'),
        's2' => examStudent($t, $year, $class, $section, '2', 'Bob'),
    ];
}

it('creates the default GPA-5 scale once', function () {
    $grading = app(GradingService::class);
    $t = gradingTenant();

    $a = $grading->ensureDefaultScale($t->id);
    $b = $grading->ensureDefaultScale($t->id);

    expect($a->id)->toBe($b->id);
    expect($a->gradePoints()->count())->toBe(7);
});

it('maps percentages to grades at the boundaries', function () {
    $grading = app(GradingService::class);
    $system = $grading->ensureDefaultScale(gradingTenant()->id);

    expect($grading->gradeFor($system, 80)['grade'])->toBe('A+');
    expect($grading->gradeFor($system, 79.99)['grade'])->toBe('A');
    expect($grading->gradeFor($system, 33)['grade'])->toBe('D');
    expect($grading->gradeFor($system, 32.99)['grade'])->toBe('F');
    expect($grading->gradeFor($system, 90)['point'])->toBe(5.0);
});

it('enters marks and auto-computes grade and point', function () {
    $env = examEnv();
    $service = app(ExamGradingService::class);

    $written = $service->enterMarks($env['math'], [
        ['student_id' => $env['s1']->id, 'marks_obtained' => 85],
        ['student_id' => $env['s2']->id, 'is_absent' => true],
    ]);

    expect($written)->toBe(2);

    $r1 = ExamResult::where('student_id', $env['s1']->id)->first();
    expect($r1->grade)->toBe('A+');
    expect((float) $r1->grade_point)->toBe(5.0);

    $r2 = ExamResult::where('student_id', $env['s2']->id)->first();
    expect($r2->is_absent)->toBeTrue();
    expect((float) $r2->grade_point)->toBe(0.0);
    expect($r2->marks_obtained)->toBeNull();
});

it('generates ranked report cards with Bangladesh fail rule', function () {
    $env = examEnv();
    $service = app(ExamGradingService::class);

    $service->enterMarks($env['math'], [
        ['student_id' => $env['s1']->id, 'marks_obtained' => 90],
        ['student_id' => $env['s2']->id, 'marks_obtained' => 30], // fails maths
    ]);
    $service->enterMarks($env['eng'], [
        ['student_id' => $env['s1']->id, 'marks_obtained' => 80],
        ['student_id' => $env['s2']->id, 'marks_obtained' => 90],
    ]);

    $cards = $service->generateReportCards($env['exam']);
    expect($cards)->toBe(2);

    $top = ReportCard::where('student_id', $env['s1']->id)->first();
    expect((float) $top->gpa)->toBe(5.0);
    expect($top->grade)->toBe('A+');
    expect($top->result)->toBe('pass');
    expect($top->rank)->toBe(1);
    expect($top->total_students)->toBe(2);

    $failer = ReportCard::where('student_id', $env['s2']->id)->first();
    expect((float) $failer->gpa)->toBe(0.0);
    expect($failer->grade)->toBe('F');
    expect($failer->result)->toBe('fail');
    expect($failer->rank)->toBe(2);
});
