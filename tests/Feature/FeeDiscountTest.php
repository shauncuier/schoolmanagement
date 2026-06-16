<?php

use App\Models\AcademicYear;
use App\Models\Discount;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\StudentFeeAllocation;
use App\Models\Tenant;
use App\Models\User;
use App\Services\FeeDiscountService;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->svc = app(FeeDiscountService::class);
});

function fdTenant(string $id = 'fd-school'): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => $id],
        ['name' => 'FD School', 'slug' => $id, 'email' => "info@{$id}.test", 'status' => 'active', 'subscription_plan' => 'free']
    );
}

function fdAllocation(Tenant $tenant, float $net = 1000, float $paid = 0): StudentFeeAllocation
{
    $year = AcademicYear::create([
        'tenant_id' => $tenant->id, 'name' => '2025-2026', 'start_date' => '2025-01-01',
        'end_date' => '2025-12-31', 'is_current' => true, 'status' => 'active',
    ]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $student = Student::create(['tenant_id' => $tenant->id, 'user_id' => $user->id, 'academic_year_id' => $year->id, 'status' => 'active']);
    $category = FeeCategory::create(['tenant_id' => $tenant->id, 'name' => 'Tuition']);
    $structure = FeeStructure::create([
        'tenant_id' => $tenant->id, 'fee_category_id' => $category->id,
        'academic_year_id' => $year->id, 'amount' => $net, 'is_active' => true,
    ]);

    return StudentFeeAllocation::create([
        'tenant_id' => $tenant->id, 'student_id' => $student->id, 'fee_structure_id' => $structure->id,
        'academic_year_id' => $year->id, 'original_amount' => $net, 'net_amount' => $net,
        'paid_amount' => $paid, 'due_amount' => $net - $paid, 'due_date' => now()->addDays(10),
        'status' => $paid > 0 ? 'partial' : 'pending',
    ]);
}

function fdManager(Tenant $tenant): User
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole('accountant'); // has manage-fees

    return $user;
}

it('applies a percentage discount', function () {
    $alloc = fdAllocation(fdTenant(), 1000);
    $discount = Discount::create(['tenant_id' => $alloc->tenant_id, 'name' => '10% off', 'type' => 'percentage', 'value' => 10, 'is_active' => true]);

    $this->svc->apply($alloc, $discount);

    expect((float) $alloc->discount_amount)->toBe(100.0);
    expect((float) $alloc->net_amount)->toBe(900.0);
    expect((float) $alloc->due_amount)->toBe(900.0);
});

it('applies a fixed discount and caps it at the original amount', function () {
    $alloc = fdAllocation(fdTenant(), 1000);
    $discount = Discount::create(['tenant_id' => $alloc->tenant_id, 'name' => 'Scholarship', 'type' => 'fixed', 'value' => 5000, 'is_active' => true]);

    $this->svc->apply($alloc, $discount);

    expect((float) $alloc->net_amount)->toBe(0.0);
    expect($alloc->status)->toBe('paid');
});

it('recomputes due against an existing partial payment', function () {
    $alloc = fdAllocation(fdTenant(), 1000, 400);
    $discount = Discount::create(['tenant_id' => $alloc->tenant_id, 'name' => '10% off', 'type' => 'percentage', 'value' => 10, 'is_active' => true]);

    $this->svc->apply($alloc, $discount);

    expect((float) $alloc->net_amount)->toBe(900.0);
    expect((float) $alloc->due_amount)->toBe(500.0);
    expect($alloc->status)->toBe('partial');
});

it('removes a discount and restores the original amount', function () {
    $alloc = fdAllocation(fdTenant(), 1000);
    $discount = Discount::create(['tenant_id' => $alloc->tenant_id, 'name' => '10% off', 'type' => 'percentage', 'value' => 10, 'is_active' => true]);
    $this->svc->apply($alloc, $discount);

    $this->svc->remove($alloc);

    expect((float) $alloc->net_amount)->toBe(1000.0);
    expect((float) $alloc->discount_amount)->toBe(0.0);
    expect($alloc->discount_id)->toBeNull();
});

it('forbids the discounts page for users without manage-fees', function () {
    // A student has view-fees (so passes the fees group) but not manage-fees.
    $student = User::factory()->create(['tenant_id' => fdTenant()->id]);
    $student->assignRole('student');
    actingAs($student);

    $this->get('/fees/discounts')->assertForbidden();
});

it('lets a fee manager create a discount', function () {
    $tenant = fdTenant();
    actingAs(fdManager($tenant));

    $this->get('/fees/discounts')->assertOk();

    $this->post('/fees/discounts', ['name' => 'Sibling', 'type' => 'percentage', 'value' => 15])
        ->assertRedirect();

    expect(Discount::where('name', 'Sibling')->exists())->toBeTrue();
});

it('rejects a percentage discount above 100', function () {
    $tenant = fdTenant();
    actingAs(fdManager($tenant));

    $this->from('/fees/discounts')
        ->post('/fees/discounts', ['name' => 'Bad', 'type' => 'percentage', 'value' => 150])
        ->assertSessionHasErrors('value');
});

it('applies a discount to an allocation via the endpoint', function () {
    $tenant = fdTenant();
    $alloc = fdAllocation($tenant, 1000);
    $discount = Discount::create(['tenant_id' => $tenant->id, 'name' => '20%', 'type' => 'percentage', 'value' => 20, 'is_active' => true]);

    actingAs(fdManager($tenant));

    $this->post("/fees/allocations/{$alloc->id}/discount", ['discount_id' => $discount->id])
        ->assertRedirect();

    expect((float) $alloc->refresh()->net_amount)->toBe(800.0);
});

it('forbids applying a discount across tenants', function () {
    $tenantA = fdTenant('fd-a');
    $alloc = fdAllocation($tenantA, 1000);
    $discount = Discount::create(['tenant_id' => $tenantA->id, 'name' => 'x', 'type' => 'fixed', 'value' => 100, 'is_active' => true]);

    $tenantB = fdTenant('fd-b');
    actingAs(fdManager($tenantB));

    $this->post("/fees/allocations/{$alloc->id}/discount", ['discount_id' => $discount->id])->assertForbidden();
});
