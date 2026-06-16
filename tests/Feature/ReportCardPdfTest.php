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
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function rcTenant(string $id = 'rc-school'): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => $id],
        ['name' => 'RC School', 'slug' => $id, 'email' => "info@{$id}.test", 'status' => 'active', 'subscription_plan' => 'free']
    );
}

/**
 * @return array{card: ReportCard, student: Student}
 */
function rcScenario(Tenant $tenant, bool $published = false): array
{
    $year = AcademicYear::create([
        'tenant_id' => $tenant->id, 'name' => '2025-2026', 'start_date' => '2025-01-01',
        'end_date' => '2025-12-31', 'is_current' => true, 'status' => 'active',
    ]);
    $class = SchoolClass::create(['tenant_id' => $tenant->id, 'name' => 'Grade 5']);
    $section = Section::create(['tenant_id' => $tenant->id, 'class_id' => $class->id, 'academic_year_id' => $year->id, 'name' => 'A']);
    $examTypeId = DB::table('exam_types')->insertGetId([
        'tenant_id' => $tenant->id, 'name' => 'Final', 'weightage' => 100, 'is_active' => true,
        'created_at' => now(), 'updated_at' => now(),
    ]);
    $exam = Exam::create([
        'tenant_id' => $tenant->id, 'name' => 'Final 2025', 'exam_type_id' => $examTypeId,
        'academic_year_id' => $year->id, 'start_date' => '2025-11-01', 'end_date' => '2025-11-10', 'status' => 'completed',
    ]);
    $subject = Subject::create(['tenant_id' => $tenant->id, 'name' => 'Math']);
    $schedule = ExamSchedule::create([
        'tenant_id' => $tenant->id, 'exam_id' => $exam->id, 'class_id' => $class->id, 'section_id' => $section->id,
        'subject_id' => $subject->id, 'date' => '2025-11-01', 'start_time' => '10:00', 'end_time' => '12:00',
        'full_marks' => 100, 'pass_marks' => 33,
    ]);
    $user = User::factory()->create(['tenant_id' => $tenant->id, 'name' => 'Karim']);
    $student = Student::create([
        'tenant_id' => $tenant->id, 'user_id' => $user->id, 'academic_year_id' => $year->id,
        'class_id' => $class->id, 'section_id' => $section->id, 'roll_number' => '7', 'status' => 'active',
    ]);
    ExamResult::create([
        'tenant_id' => $tenant->id, 'exam_id' => $exam->id, 'exam_schedule_id' => $schedule->id,
        'student_id' => $student->id, 'subject_id' => $subject->id, 'marks_obtained' => 85, 'grade' => 'A+', 'grade_point' => 5.0,
    ]);
    $card = ReportCard::create([
        'tenant_id' => $tenant->id, 'student_id' => $student->id, 'exam_id' => $exam->id,
        'class_id' => $class->id, 'section_id' => $section->id, 'total_marks' => 100, 'obtained_marks' => 85,
        'percentage' => 85, 'gpa' => 5.0, 'grade' => 'A+', 'rank' => 1, 'total_students' => 1,
        'result' => 'pass', 'is_published' => $published,
    ]);

    return compact('card', 'student');
}

function rcStaff(Tenant $tenant): User
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole('school-owner'); // generate-report-cards + view-report-cards

    return $user;
}

it('lets results staff download any report card as PDF', function () {
    $tenant = rcTenant();
    ['card' => $card] = rcScenario($tenant); // unpublished

    actingAs(rcStaff($tenant));

    $this->get("/report-cards/{$card->id}/pdf")
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

it('lets the owning student download their published report card', function () {
    $tenant = rcTenant();
    ['card' => $card, 'student' => $student] = rcScenario($tenant, published: true);

    $owner = $student->user;
    $owner->assignRole('student');
    actingAs($owner);

    $this->get("/report-cards/{$card->id}/pdf")
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

it('hides an unpublished report card from the student', function () {
    $tenant = rcTenant();
    ['card' => $card, 'student' => $student] = rcScenario($tenant); // unpublished

    $owner = $student->user;
    $owner->assignRole('student');
    actingAs($owner);

    $this->get("/report-cards/{$card->id}/pdf")->assertNotFound();
});

it('forbids downloading another student\'s report card', function () {
    $tenant = rcTenant();
    ['card' => $card] = rcScenario($tenant, published: true);

    $other = User::factory()->create(['tenant_id' => $tenant->id]);
    $other->assignRole('student');
    actingAs($other);

    $this->get("/report-cards/{$card->id}/pdf")->assertForbidden();
});

it('forbids downloading a report card from another tenant', function () {
    $tenantA = rcTenant('rc-a');
    ['card' => $cardA] = rcScenario($tenantA, published: true);

    $tenantB = rcTenant('rc-b');
    actingAs(rcStaff($tenantB));

    $this->get("/report-cards/{$cardA->id}/pdf")->assertForbidden();
});
