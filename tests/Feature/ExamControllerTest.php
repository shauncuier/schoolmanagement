<?php

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ExamSchedule;
use App\Models\ReportCard;
use App\Models\Tenant;
use App\Models\User;
use App\Services\Exam\ExamGradingService;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function examManager(Tenant $tenant, string $role): User
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole($role);

    return $user;
}

it('forbids exam listing for users without view-exams', function () {
    $env = examEnv();
    actingAs(examManager($env['t'], 'accountant')); // accountant lacks view-exams

    $this->get('/exams')->assertForbidden();
});

it('lets an authorised user list exams', function () {
    $env = examEnv();
    actingAs(examManager($env['t'], 'school-owner'));

    $this->get('/exams')->assertOk();
});

it('forbids exam creation for a teacher', function () {
    $env = examEnv();
    actingAs(examManager($env['t'], 'teacher')); // view-exams but not create-exams

    $this->get('/exams/create')->assertForbidden();
});

it('creates an exam', function () {
    $env = examEnv();
    actingAs(examManager($env['t'], 'school-owner'));

    $this->post('/exams', [
        'name' => 'Midterm 2025',
        'exam_type_id' => $env['exam']->exam_type_id,
        'academic_year_id' => $env['exam']->academic_year_id,
        'start_date' => '2025-06-01',
        'end_date' => '2025-06-10',
    ])->assertRedirect('/exams');

    expect(Exam::where('name', 'Midterm 2025')->exists())->toBeTrue();
});

it('adds a subject schedule to an exam', function () {
    $env = examEnv();
    $math = $env['math'];
    actingAs(examManager($env['t'], 'school-owner'));

    $this->post("/exams/{$env['exam']->id}/schedules", [
        'class_id' => $math->class_id,
        'section_id' => $math->section_id,
        'subject_id' => $math->subject_id,
        'date' => '2025-11-02',
        'start_time' => '10:00',
        'end_time' => '12:00',
        'full_marks' => 100,
        'pass_marks' => 33,
    ])->assertRedirect();

    expect(ExamSchedule::where('exam_id', $env['exam']->id)->count())->toBe(3);
});

it('lets a teacher enter marks for a schedule', function () {
    $env = examEnv();
    actingAs(examManager($env['t'], 'teacher')); // teacher has enter-results

    $this->put("/exam-schedules/{$env['math']->id}/marks", [
        'marks' => [
            ['student_id' => $env['s1']->id, 'marks_obtained' => 77],
            ['student_id' => $env['s2']->id, 'is_absent' => true],
        ],
    ])->assertRedirect();

    expect(ExamResult::where('exam_schedule_id', $env['math']->id)->count())->toBe(2);
});

it('generates report cards from the admin endpoint', function () {
    $env = examEnv();
    $grading = app(ExamGradingService::class);
    $grading->enterMarks($env['math'], [
        ['student_id' => $env['s1']->id, 'marks_obtained' => 80],
        ['student_id' => $env['s2']->id, 'marks_obtained' => 70],
    ]);
    $grading->enterMarks($env['eng'], [
        ['student_id' => $env['s1']->id, 'marks_obtained' => 75],
        ['student_id' => $env['s2']->id, 'marks_obtained' => 65],
    ]);

    actingAs(examManager($env['t'], 'school-owner')); // has manage-results

    $this->post("/exams/{$env['exam']->id}/report-cards")->assertRedirect();

    expect(ReportCard::where('exam_id', $env['exam']->id)->count())->toBe(2);
});

it('renders the exam detail page', function () {
    $env = examEnv();
    actingAs(examManager($env['t'], 'school-owner'));

    $this->get("/exams/{$env['exam']->id}")->assertOk();
});

it('prevents editing an exam from another tenant', function () {
    $env = examEnv();
    $other = Tenant::firstOrCreate(
        ['id' => 'other-exam-school'],
        ['name' => 'Other', 'slug' => 'other-exam-school', 'email' => 'o@s.test', 'status' => 'active', 'subscription_plan' => 'free']
    );
    actingAs(examManager($other, 'school-owner'));

    $this->get("/exams/{$env['exam']->id}/edit")->assertForbidden();
});
