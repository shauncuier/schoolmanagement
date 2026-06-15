<?php

use App\Models\Tenant;
use App\Models\User;
use App\Services\Payment\PaymentService;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function staffPayer(Tenant $tenant): User
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole('accountant'); // has view-fees + collect-fees

    return $user;
}

it('lets the owning student open the payment screen', function () {
    $tenant = payTenant();
    ['alloc' => $alloc, 'user' => $owner] = makeAllocation($tenant);
    $owner->assignRole('student');

    actingAs($owner);
    $this->get("/fees/pay/{$alloc->id}")->assertOk();
});

it('lets fee-collecting staff open the payment screen', function () {
    $tenant = payTenant();
    ['alloc' => $alloc] = makeAllocation($tenant);

    actingAs(staffPayer($tenant));
    $this->get("/fees/pay/{$alloc->id}")->assertOk();
});

it('forbids paying another tenant\'s allocation', function () {
    $tenantA = payTenant('pay-a');
    ['alloc' => $allocA] = makeAllocation($tenantA);

    $tenantB = payTenant('pay-b');
    actingAs(staffPayer($tenantB));

    $this->get("/fees/pay/{$allocA->id}")->assertForbidden();
});

it('forbids a non-owning student from paying someone else', function () {
    $tenant = payTenant();
    ['alloc' => $alloc] = makeAllocation($tenant);

    $other = User::factory()->create(['tenant_id' => $tenant->id]);
    $other->assignRole('student'); // has view-fees but is not the owner
    actingAs($other);

    $this->get("/fees/pay/{$alloc->id}")->assertForbidden();
});

it('redirects to the gateway on initiate', function () {
    $tenant = payTenant();
    ['alloc' => $alloc] = makeAllocation($tenant);

    actingAs(staffPayer($tenant));

    $this->post("/fees/pay/{$alloc->id}", ['gateway' => 'sandbox'])
        ->assertRedirectContains('fees/pay/callback/sandbox');
});

it('settles via the public callback and marks the allocation paid', function () {
    $tenant = payTenant();
    ['alloc' => $alloc] = makeAllocation($tenant);
    $intent = app(PaymentService::class)->createIntent($alloc, 'sandbox');

    // Public callback — no authentication.
    $this->get("/fees/pay/callback/sandbox?reference={$intent->reference}&status=success")
        ->assertRedirect();

    expect($alloc->refresh()->status)->toBe('paid');
});

it('renders the payment status page', function () {
    $tenant = payTenant();
    ['alloc' => $alloc, 'user' => $owner] = makeAllocation($tenant);
    $owner->assignRole('student');
    $intent = app(PaymentService::class)->createIntent($alloc, 'sandbox');

    actingAs($owner);
    $this->get("/fees/payment-status?reference={$intent->reference}")
        ->assertOk();
});
