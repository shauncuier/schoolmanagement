<?php

use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\StudentFeeAllocation;
use App\Models\Tenant;
use App\Models\User;
use App\Services\LateFeeService;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->svc = app(LateFeeService::class);
});

function lfTenant(string $id = 'lf-school'): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => $id],
        ['name' => 'LF School', 'slug' => $id, 'email' => "info@{$id}.test", 'status' => 'active', 'subscription_plan' => 'free']
    );
}

function lfAllocation(Tenant $tenant, float $lateFee = 50, int $grace = 5, int $dueDaysAgo = 10): StudentFeeAllocation
{
    $year = AcademicYear::create([
        'tenant_id' => $tenant->id, 'name' => '2025-2026', 'start_date' => '2025-01-01',
        'end_date' => '2025-12-31', 'is_current' => true, 'status' => 'active',
    ]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $student = Student::create(['tenant_id' => $tenant->id, 'user_id' => $user->id, 'academic_year_id' => $year->id, 'status' => 'active']);
    $category = FeeCategory::create(['tenant_id' => $tenant->id, 'name' => 'Tuition']);
    $structure = FeeStructure::create([
        'tenant_id' => $tenant->id, 'fee_category_id' => $category->id, 'academic_year_id' => $year->id,
        'amount' => 1000, 'late_fee' => $lateFee, 'late_fee_grace_days' => $grace, 'is_active' => true,
    ]);

    return StudentFeeAllocation::create([
        'tenant_id' => $tenant->id, 'student_id' => $student->id, 'fee_structure_id' => $structure->id,
        'academic_year_id' => $year->id, 'original_amount' => 1000, 'net_amount' => 1000,
        'paid_amount' => 0, 'due_amount' => 1000, 'due_date' => now()->subDays($dueDaysAgo), 'status' => 'pending',
    ]);
}

function lfManager(Tenant $tenant): User
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole('accountant'); // manage-fees

    return $user;
}

it('charges a late fee on an overdue allocation', function () {
    $alloc = lfAllocation(lfTenant(), lateFee: 50, grace: 5, dueDaysAgo: 10);

    expect($this->svc->applyTo($alloc))->toBeTrue();

    $alloc->refresh();
    expect((float) $alloc->late_fee)->toBe(50.0);
    expect((float) $alloc->due_amount)->toBe(1050.0);
    expect((float) $alloc->net_amount)->toBe(1050.0);
    expect($alloc->status)->toBe('overdue');
});

it('does not charge before the grace period ends', function () {
    $alloc = lfAllocation(lfTenant(), lateFee: 50, grace: 5, dueDaysAgo: 2); // 2 days < 5 grace

    expect($this->svc->applyTo($alloc))->toBeFalse();
    expect((float) $alloc->refresh()->late_fee)->toBe(0.0);
});

it('does not charge a late fee twice', function () {
    $alloc = lfAllocation(lfTenant(), lateFee: 50, grace: 5, dueDaysAgo: 10);
    $this->svc->applyTo($alloc);

    expect($this->svc->applyTo($alloc->refresh()))->toBeFalse();
    expect((float) $alloc->refresh()->due_amount)->toBe(1050.0);
});

it('does nothing when the structure has no late fee', function () {
    $alloc = lfAllocation(lfTenant(), lateFee: 0, grace: 0, dueDaysAgo: 30);

    expect($this->svc->applyTo($alloc))->toBeFalse();
});

it('applies overdue late fees in bulk and only once', function () {
    $tenant = lfTenant();
    lfAllocation($tenant, lateFee: 50, grace: 5, dueDaysAgo: 10);
    lfAllocation($tenant, lateFee: 50, grace: 5, dueDaysAgo: 10);
    lfAllocation($tenant, lateFee: 50, grace: 5, dueDaysAgo: 1); // not overdue

    expect($this->svc->applyOverdue($tenant->id))->toBe(2);
    expect($this->svc->applyOverdue($tenant->id))->toBe(0); // re-run: already charged
});

it('lets a fee manager run late fees via the endpoint', function () {
    $tenant = lfTenant();
    $alloc = lfAllocation($tenant, lateFee: 50, grace: 5, dueDaysAgo: 10);

    actingAs(lfManager($tenant));

    $this->post('/fees/late-fees/run')->assertRedirect();

    expect((float) $alloc->refresh()->late_fee)->toBe(50.0);
});

it('forbids running late fees for users without manage-fees', function () {
    $tenant = lfTenant();
    $student = User::factory()->create(['tenant_id' => $tenant->id]);
    $student->assignRole('student');
    actingAs($student);

    $this->post('/fees/late-fees/run')->assertForbidden();
});
