<?php

use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\StudentFeeAllocation;
use App\Models\Tenant;
use App\Models\User;
use App\Services\Payment\PaymentService;

function payTenant(string $id = 'pay-school'): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => $id],
        ['name' => ucfirst($id), 'slug' => $id, 'email' => "info@{$id}.test", 'status' => 'active', 'subscription_plan' => 'free']
    );
}

/**
 * @return array{alloc: StudentFeeAllocation, student: Student, user: User}
 */
function makeAllocation(Tenant $tenant, float $net = 1500): array
{
    $year = AcademicYear::create([
        'tenant_id' => $tenant->id, 'name' => '2025-2026', 'start_date' => '2025-01-01',
        'end_date' => '2025-12-31', 'is_current' => true, 'status' => 'active',
    ]);
    $user = User::factory()->create(['tenant_id' => $tenant->id, 'name' => 'Rahim', 'phone' => '01712345678']);
    $student = Student::create([
        'tenant_id' => $tenant->id, 'user_id' => $user->id, 'academic_year_id' => $year->id, 'status' => 'active',
    ]);
    $category = FeeCategory::create(['tenant_id' => $tenant->id, 'name' => 'Tuition']);
    $structure = FeeStructure::create([
        'tenant_id' => $tenant->id, 'fee_category_id' => $category->id,
        'academic_year_id' => $year->id, 'amount' => $net, 'is_active' => true,
    ]);
    $alloc = StudentFeeAllocation::create([
        'tenant_id' => $tenant->id, 'student_id' => $student->id, 'fee_structure_id' => $structure->id,
        'academic_year_id' => $year->id, 'original_amount' => $net, 'net_amount' => $net,
        'paid_amount' => 0, 'due_amount' => $net, 'due_date' => now()->addDays(10), 'status' => 'pending',
    ]);

    return compact('alloc', 'student', 'user');
}

beforeEach(function () {
    $this->svc = app(PaymentService::class);
});

it('creates a pending intent for the outstanding due', function () {
    ['alloc' => $alloc] = makeAllocation(payTenant());

    $intent = $this->svc->createIntent($alloc, 'sandbox');

    expect($intent->status)->toBe('pending');
    expect((float) $intent->amount)->toBe(1500.0);
    expect($intent->reference)->toStartWith('PI-');
    expect($intent->expires_at->isFuture())->toBeTrue();
});

it('never lets the intent exceed the amount due', function () {
    ['alloc' => $alloc] = makeAllocation(payTenant(), 1500);

    $intent = $this->svc->createIntent($alloc, 'sandbox', 5000);

    expect((float) $intent->amount)->toBe(1500.0);
});

it('rejects an intent when nothing is due', function () {
    ['alloc' => $alloc] = makeAllocation(payTenant());
    $alloc->update(['due_amount' => 0, 'paid_amount' => 1500, 'status' => 'paid']);

    expect(fn () => $this->svc->createIntent($alloc, 'sandbox'))
        ->toThrow(InvalidArgumentException::class);
});

it('settles a successful sandbox payment', function () {
    ['alloc' => $alloc] = makeAllocation(payTenant());
    $intent = $this->svc->createIntent($alloc, 'sandbox');

    $result = $this->svc->handleCallback('sandbox', ['reference' => $intent->reference, 'status' => 'success']);

    expect($result->status)->toBe('completed');
    expect(FeePayment::count())->toBe(1);

    $payment = FeePayment::first();
    expect($payment->payment_method)->toBe('mobile_banking');
    expect($payment->gateway)->toBe('sandbox');
    expect((float) $payment->amount)->toBe(1500.0);

    $alloc->refresh();
    expect((float) $alloc->due_amount)->toBe(0.0);
    expect($alloc->status)->toBe('paid');
});

it('is idempotent — a repeated callback does not double-charge', function () {
    ['alloc' => $alloc] = makeAllocation(payTenant());
    $intent = $this->svc->createIntent($alloc, 'sandbox');
    $payload = ['reference' => $intent->reference, 'status' => 'success'];

    $this->svc->handleCallback('sandbox', $payload);
    $this->svc->handleCallback('sandbox', $payload);

    expect(FeePayment::count())->toBe(1);
    expect((float) $alloc->refresh()->due_amount)->toBe(0.0);
});

it('records a partial payment', function () {
    ['alloc' => $alloc] = makeAllocation(payTenant(), 1500);
    $intent = $this->svc->createIntent($alloc, 'sandbox', 500);

    $this->svc->handleCallback('sandbox', ['reference' => $intent->reference, 'status' => 'success']);

    $alloc->refresh();
    expect((float) $alloc->paid_amount)->toBe(500.0);
    expect((float) $alloc->due_amount)->toBe(1000.0);
    expect($alloc->status)->toBe('partial');
});

it('settles the server-side amount, ignoring a tampered callback amount', function () {
    ['alloc' => $alloc] = makeAllocation(payTenant(), 1500);
    $intent = $this->svc->createIntent($alloc, 'sandbox', 500);

    // Attacker claims a larger amount in the callback.
    $this->svc->handleCallback('sandbox', ['reference' => $intent->reference, 'status' => 'success', 'amount' => 99999]);

    expect((float) FeePayment::first()->amount)->toBe(500.0);
});

it('marks a failed callback without creating a payment', function () {
    ['alloc' => $alloc] = makeAllocation(payTenant());
    $intent = $this->svc->createIntent($alloc, 'sandbox');

    $result = $this->svc->handleCallback('sandbox', ['reference' => $intent->reference, 'status' => 'cancelled']);

    expect($result->status)->toBe('failed');
    expect(FeePayment::count())->toBe(0);
});

it('returns null for an unknown reference', function () {
    expect($this->svc->handleCallback('sandbox', ['reference' => 'PI-DOESNOTEXIST', 'status' => 'success']))->toBeNull();
});

it('expires an intent past its TTL', function () {
    ['alloc' => $alloc] = makeAllocation(payTenant());
    $intent = $this->svc->createIntent($alloc, 'sandbox');
    $intent->update(['expires_at' => now()->subMinute()]);

    $result = $this->svc->handleCallback('sandbox', ['reference' => $intent->reference, 'status' => 'success']);

    expect($result->status)->toBe('expired');
    expect(FeePayment::count())->toBe(0);
});
