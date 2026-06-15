<?php

use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentFeeAllocation;
use App\Models\Tenant;
use App\Models\User;
use App\Services\FeeAllocationService;

function makeClass(Tenant $tenant, string $name): SchoolClass
{
    return SchoolClass::create([
        'tenant_id' => $tenant->id,
        'name' => $name,
    ]);
}

function makeTenant(string $id): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => $id],
        [
            'name' => ucfirst($id),
            'slug' => $id,
            'email' => "info@{$id}.test",
            'status' => 'active',
            'subscription_plan' => 'free',
        ]
    );
}

function makeAcademicYear(Tenant $tenant): AcademicYear
{
    return AcademicYear::create([
        'tenant_id' => $tenant->id,
        'name' => '2025-2026',
        'start_date' => '2025-01-01',
        'end_date' => '2025-12-31',
        'is_current' => true,
        'status' => 'active',
    ]);
}

function makeStudent(Tenant $tenant, AcademicYear $year, array $overrides = []): Student
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);

    return Student::create(array_merge([
        'tenant_id' => $tenant->id,
        'user_id' => $user->id,
        'academic_year_id' => $year->id,
        'status' => 'active',
    ], $overrides));
}

function makeStructure(Tenant $tenant, AcademicYear $year, array $overrides = []): FeeStructure
{
    $category = FeeCategory::create([
        'tenant_id' => $tenant->id,
        'name' => 'Tuition',
    ]);

    return FeeStructure::create(array_merge([
        'tenant_id' => $tenant->id,
        'fee_category_id' => $category->id,
        'academic_year_id' => $year->id,
        'amount' => 1000,
        'due_date' => '2025-03-01',
        'is_active' => true,
    ], $overrides));
}

it('allocates a tenant-wide structure to every active student in that tenant only', function () {
    $service = app(FeeAllocationService::class);

    $tenantA = makeTenant('tenant-a');
    $yearA = makeAcademicYear($tenantA);
    makeStudent($tenantA, $yearA);
    makeStudent($tenantA, $yearA);

    // A student in another tenant must never be touched.
    $tenantB = makeTenant('tenant-b');
    $yearB = makeAcademicYear($tenantB);
    makeStudent($tenantB, $yearB);

    $structure = makeStructure($tenantA, $yearA, ['class_id' => null]);

    $count = $service->allocate($structure);

    expect($count)->toBe(2);
    expect(StudentFeeAllocation::count())->toBe(2);
    expect(StudentFeeAllocation::where('tenant_id', $tenantB->id)->count())->toBe(0);
});

it('does not create duplicate allocations on repeated runs', function () {
    $service = app(FeeAllocationService::class);

    $tenant = makeTenant('tenant-a');
    $year = makeAcademicYear($tenant);
    makeStudent($tenant, $year);
    $structure = makeStructure($tenant, $year, ['class_id' => null]);

    expect($service->allocate($structure))->toBe(1);
    expect($service->allocate($structure))->toBe(0);
    expect(StudentFeeAllocation::count())->toBe(1);
});

it('only allocates a class-specific structure to students in that class', function () {
    $service = app(FeeAllocationService::class);

    $tenant = makeTenant('tenant-a');
    $year = makeAcademicYear($tenant);
    $classA = makeClass($tenant, 'Grade 5');
    $classB = makeClass($tenant, 'Grade 9');
    $inClass = makeStudent($tenant, $year, ['class_id' => $classA->id]);
    makeStudent($tenant, $year, ['class_id' => $classB->id]);

    $structure = makeStructure($tenant, $year, ['class_id' => $classA->id]);

    expect($service->allocate($structure))->toBe(1);
    expect(StudentFeeAllocation::where('student_id', $inClass->id)->exists())->toBeTrue();
});

it('skips inactive students', function () {
    $service = app(FeeAllocationService::class);

    $tenant = makeTenant('tenant-a');
    $year = makeAcademicYear($tenant);
    makeStudent($tenant, $year, ['status' => 'inactive']);
    $structure = makeStructure($tenant, $year, ['class_id' => null]);

    expect($service->allocate($structure))->toBe(0);
});

it('allocates structures with no due date by falling back to today', function () {
    $service = app(FeeAllocationService::class);

    $tenant = makeTenant('tenant-a');
    $year = makeAcademicYear($tenant);
    $student = makeStudent($tenant, $year);
    $structure = makeStructure($tenant, $year, ['class_id' => null, 'due_date' => null]);

    expect($service->allocate($structure))->toBe(1);

    $allocation = StudentFeeAllocation::where('student_id', $student->id)->first();
    expect($allocation)->not->toBeNull();
    expect($allocation->due_date)->not->toBeNull();
});

it('allocates all matching structures to a single student', function () {
    $service = app(FeeAllocationService::class);

    $tenant = makeTenant('tenant-a');
    $year = makeAcademicYear($tenant);
    $classMatch = makeClass($tenant, 'Grade 3');
    $classOther = makeClass($tenant, 'Grade 8');
    $student = makeStudent($tenant, $year, ['class_id' => $classMatch->id]);

    makeStructure($tenant, $year, ['class_id' => null]);             // applies to all
    makeStructure($tenant, $year, ['class_id' => $classMatch->id]);  // matches class
    makeStructure($tenant, $year, ['class_id' => $classOther->id]);  // different class

    expect($service->allocateAllToStudent($student))->toBe(2);
});
