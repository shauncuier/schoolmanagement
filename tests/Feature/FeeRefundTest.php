<?php

use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeePayment;
use App\Models\FeeRefund;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\StudentFeeAllocation;
use App\Models\Tenant;
use App\Models\User;
use App\Services\FeeRefundService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->svc = app(FeeRefundService::class);
});

function frTenant(string $id = 'fr-school'): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => $id],
        ['name' => 'FR School', 'slug' => $id, 'email' => "info@{$id}.test", 'status' => 'active', 'subscription_plan' => 'free']
    );
}

/**
 * @return array{payment: FeePayment, alloc: StudentFeeAllocation}
 */
function frPayment(Tenant $tenant, float $amount = 1000): array
{
    $year = AcademicYear::create([
        'tenant_id' => $tenant->id, 'name' => '2025-2026', 'start_date' => '2025-01-01',
        'end_date' => '2025-12-31', 'is_current' => true, 'status' => 'active',
    ]);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $student = Student::create(['tenant_id' => $tenant->id, 'user_id' => $user->id, 'academic_year_id' => $year->id, 'status' => 'active']);
    $category = FeeCategory::create(['tenant_id' => $tenant->id, 'name' => 'Tuition']);
    $structure = FeeStructure::create(['tenant_id' => $tenant->id, 'fee_category_id' => $category->id, 'academic_year_id' => $year->id, 'amount' => $amount, 'is_active' => true]);
    $alloc = StudentFeeAllocation::create([
        'tenant_id' => $tenant->id, 'student_id' => $student->id, 'fee_structure_id' => $structure->id,
        'academic_year_id' => $year->id, 'original_amount' => $amount, 'net_amount' => $amount,
        'paid_amount' => $amount, 'due_amount' => 0, 'due_date' => now(), 'status' => 'paid',
    ]);
    $payment = FeePayment::create([
        'tenant_id' => $tenant->id, 'student_id' => $student->id, 'student_fee_allocation_id' => $alloc->id,
        'academic_year_id' => $year->id, 'receipt_number' => 'RCP-'.Str::upper(Str::random(8)),
        'amount' => $amount, 'total_amount' => $amount, 'payment_method' => 'cash', 'status' => 'completed', 'paid_at' => now(),
    ]);

    return compact('payment', 'alloc');
}

function frManager(Tenant $tenant): User
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole('accountant'); // has process-refunds

    return $user;
}

it('fully refunds a payment and reopens the allocation', function () {
    ['payment' => $payment, 'alloc' => $alloc] = frPayment(frTenant(), 1000);

    $this->svc->process($payment, 1000, 'Withdrawal');

    expect(FeeRefund::count())->toBe(1);
    expect($payment->refresh()->status)->toBe('refunded');
    $alloc->refresh();
    expect((float) $alloc->paid_amount)->toBe(0.0);
    expect((float) $alloc->due_amount)->toBe(1000.0);
    expect($alloc->status)->toBe('pending');
});

it('partially refunds a payment', function () {
    ['payment' => $payment, 'alloc' => $alloc] = frPayment(frTenant(), 1000);

    $this->svc->process($payment, 400, 'Adjustment');

    expect($payment->refresh()->status)->toBe('completed');
    $alloc->refresh();
    expect((float) $alloc->paid_amount)->toBe(600.0);
    expect((float) $alloc->due_amount)->toBe(400.0);
    expect($alloc->status)->toBe('partial');
});

it('rejects an over-refund', function () {
    ['payment' => $payment] = frPayment(frTenant(), 1000);

    expect(fn () => $this->svc->process($payment, 1500, 'too much'))
        ->toThrow(InvalidArgumentException::class);
});

it('rejects a second refund beyond the remaining balance', function () {
    ['payment' => $payment] = frPayment(frTenant(), 1000);
    $this->svc->process($payment, 600, 'first');

    expect(fn () => $this->svc->process($payment, 600, 'second'))
        ->toThrow(InvalidArgumentException::class);
});

it('forbids refunds for users without process-refunds', function () {
    $tenant = frTenant();
    ['payment' => $payment] = frPayment($tenant);

    $student = User::factory()->create(['tenant_id' => $tenant->id]);
    $student->assignRole('student');
    actingAs($student);

    $this->post("/fees/payments/{$payment->id}/refund", ['refund_amount' => 100, 'reason' => 'x'])->assertForbidden();
});

it('processes a refund via the endpoint', function () {
    $tenant = frTenant();
    ['payment' => $payment, 'alloc' => $alloc] = frPayment($tenant, 1000);

    actingAs(frManager($tenant));

    $this->post("/fees/payments/{$payment->id}/refund", ['refund_amount' => 250, 'reason' => 'Overpaid'])
        ->assertRedirect();

    expect(FeeRefund::count())->toBe(1);
    expect((float) $alloc->refresh()->due_amount)->toBe(250.0);
});

it('renders the refunds page', function () {
    $tenant = frTenant();
    actingAs(frManager($tenant));

    $this->get('/fees/refunds')->assertOk();
});

it('forbids refunding a payment from another tenant', function () {
    $tenantA = frTenant('fr-a');
    ['payment' => $paymentA] = frPayment($tenantA);

    $tenantB = frTenant('fr-b');
    actingAs(frManager($tenantB));

    $this->post("/fees/payments/{$paymentA->id}/refund", ['refund_amount' => 100, 'reason' => 'x'])->assertForbidden();
});
