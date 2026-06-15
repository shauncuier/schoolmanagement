<?php

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @return array{0: User, 1: Tenant}
 */
function schoolUserWithRole(string $role): array
{
    $tenant = Tenant::firstOrCreate(
        ['id' => 'test-school'],
        [
            'name' => 'Test School',
            'slug' => 'test-school',
            'email' => 'info@test-school.com',
            'status' => 'active',
            'subscription_plan' => 'free',
        ]
    );

    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole($role);

    return [$user, $tenant];
}

it('forbids users without the manage-settings permission', function () {
    [$user] = schoolUserWithRole('student');
    actingAs($user);

    $this->get('/school-settings')->assertForbidden();
});

it('lets an authorised user view settings resolved from their own tenant', function () {
    // Proves the controller resolves the tenant from the authenticated user
    // (previously it relied on Stancl's tenant() helper and always 403'd here).
    [$user] = schoolUserWithRole('school-owner');
    actingAs($user);

    $this->get('/school-settings')->assertOk();
});

it('persists general settings to the authenticated user\'s tenant', function () {
    [$user, $tenant] = schoolUserWithRole('school-owner');
    actingAs($user);

    $this->put('/school-settings/general', [
        'name' => 'Renamed Academy',
        'email' => 'new@school.com',
    ])->assertRedirect();

    expect($tenant->fresh()->name)->toBe('Renamed Academy');
});

it('rejects invalid general settings input', function () {
    [$user] = schoolUserWithRole('school-owner');
    actingAs($user);

    $this->from('/school-settings')
        ->put('/school-settings/general', [
            'name' => '',
            'email' => 'not-an-email',
        ])
        ->assertSessionHasErrors(['name', 'email']);
});
