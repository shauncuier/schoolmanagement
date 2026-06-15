<?php

use App\Models\AcademicYear;
use App\Models\Exam;
use App\Models\NotificationLog;
use App\Models\ReportCard;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use App\Services\ResultService;
use Illuminate\Support\Facades\DB;

function resultTenant(string $id = 'result-school'): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => $id],
        ['name' => ucfirst($id), 'slug' => $id, 'email' => "info@{$id}.test", 'status' => 'active', 'subscription_plan' => 'free']
    );
}

/**
 * Build a full exam → student → report card graph for a tenant.
 *
 * @return array{exam: Exam, student: Student, card: ReportCard}
 */
function buildResultScenario(Tenant $tenant, array $opts = []): array
{
    $year = AcademicYear::create([
        'tenant_id' => $tenant->id, 'name' => '2025-2026',
        'start_date' => '2025-01-01', 'end_date' => '2025-12-31',
        'is_current' => true, 'status' => 'active',
    ]);
    $class = SchoolClass::create(['tenant_id' => $tenant->id, 'name' => 'Grade 5']);
    $section = Section::create([
        'tenant_id' => $tenant->id, 'class_id' => $class->id,
        'academic_year_id' => $year->id, 'name' => 'A',
    ]);
    $examTypeId = DB::table('exam_types')->insertGetId([
        'tenant_id' => $tenant->id, 'name' => 'Final', 'weightage' => 100,
        'is_active' => true, 'created_at' => now(), 'updated_at' => now(),
    ]);
    $exam = Exam::create([
        'tenant_id' => $tenant->id, 'name' => 'Final 2025', 'exam_type_id' => $examTypeId,
        'academic_year_id' => $year->id, 'start_date' => '2025-11-01', 'end_date' => '2025-11-10',
        'status' => 'completed', 'is_published' => false,
    ]);
    $user = User::factory()->create([
        'tenant_id' => $tenant->id, 'name' => 'Karim', 'phone' => $opts['phone'] ?? '01712345678',
    ]);
    $student = Student::create([
        'tenant_id' => $tenant->id, 'user_id' => $user->id, 'academic_year_id' => $year->id,
        'class_id' => $class->id, 'roll_number' => $opts['roll'] ?? '7', 'status' => 'active',
    ]);
    $card = ReportCard::create([
        'tenant_id' => $tenant->id, 'student_id' => $student->id, 'exam_id' => $exam->id,
        'class_id' => $class->id, 'section_id' => $section->id,
        'gpa' => 4.50, 'grade' => 'A', 'result' => 'pass',
        'rank' => 3, 'total_students' => 30, 'is_published' => false,
    ]);

    return compact('exam', 'student', 'card');
}

beforeEach(function () {
    $this->service = app(ResultService::class);
});

it('publishes an exam and its report cards', function () {
    $tenant = resultTenant();
    ['exam' => $exam, 'card' => $card] = buildResultScenario($tenant);

    $result = $this->service->publish($exam);

    expect($result['report_cards'])->toBe(1);
    expect($exam->fresh()->is_published)->toBeTrue();
    expect($exam->fresh()->result_published_at)->not->toBeNull();
    expect($card->fresh()->is_published)->toBeTrue();
});

it('unpublishes an exam and its report cards', function () {
    $tenant = resultTenant();
    ['exam' => $exam, 'card' => $card] = buildResultScenario($tenant);
    $this->service->publish($exam);

    $this->service->unpublish($exam);

    expect($exam->fresh()->is_published)->toBeFalse();
    expect($card->fresh()->is_published)->toBeFalse();
});

it('returns a published result on lookup by roll', function () {
    $tenant = resultTenant();
    ['exam' => $exam] = buildResultScenario($tenant);
    $this->service->publish($exam);

    $data = $this->service->lookup($tenant, $exam->id, '7');

    expect($data)->not->toBeNull();
    expect($data['student']['name'])->toBe('Karim');
    expect($data['summary']['gpa'])->toBe('4.50');
    expect($data['summary']['result'])->toBe('pass');
});

it('hides results that are not published', function () {
    $tenant = resultTenant();
    ['exam' => $exam] = buildResultScenario($tenant);

    expect($this->service->lookup($tenant, $exam->id, '7'))->toBeNull();
});

it('returns null for an unknown roll number', function () {
    $tenant = resultTenant();
    ['exam' => $exam] = buildResultScenario($tenant);
    $this->service->publish($exam);

    expect($this->service->lookup($tenant, $exam->id, '999'))->toBeNull();
});

it('does not leak results across tenants', function () {
    $tenantA = resultTenant('school-a');
    ['exam' => $examA] = buildResultScenario($tenantA);
    $this->service->publish($examA);

    $tenantB = resultTenant('school-b');

    // Same roll, but looked up under a different school.
    expect($this->service->lookup($tenantB, $examA->id, '7'))->toBeNull();
});

it('sms-notifies guardians when publishing with notify', function () {
    $tenant = resultTenant();
    ['exam' => $exam] = buildResultScenario($tenant);

    $result = $this->service->publish($exam, notify: true);

    expect($result['sms'])->toBe(1);
    expect(NotificationLog::where('type', 'sms')->where('status', 'sent')->count())->toBe(1);
});
