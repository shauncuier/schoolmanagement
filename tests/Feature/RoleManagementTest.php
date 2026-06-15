<?php

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

/**
 * Create a verified user that belongs to a tenant and holds the given role.
 */
function userWithRole(string $role): User
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

    return $user;
}

it('redirects guests away from role management', function () {
    $this->get('/roles')->assertRedirect('/login');
});

it('forbids a non super-admin from viewing roles', function () {
    actingAs(userWithRole('teacher'));

    $this->get('/roles')->assertForbidden();
});

it('forbids a school owner from escalating privileges by creating roles', function () {
    // School owners have manage-roles, but roles are global (Spatie teams off),
    // so route access is restricted to the platform super-admin only.
    actingAs(userWithRole('school-owner'));

    $this->post('/roles', [
        'name' => 'Backdoor Role',
        'permissions' => ['manage-users', 'manage-tenants'],
    ])->assertForbidden();

    expect(Role::where('name', 'backdoor-role')->exists())->toBeFalse();
});

it('lets a super-admin view and create roles', function () {
    $admin = User::factory()->create();
    $admin->assignRole('super-admin');
    actingAs($admin);

    $this->get('/roles')->assertOk();

    $this->post('/roles', [
        'name' => 'Test Role',
        'permissions' => ['view-dashboard'],
    ])->assertRedirect('/roles');

    expect(Role::where('name', 'test-role')->exists())->toBeTrue();
});

it('rejects a new role whose normalised name collides with an existing role', function () {
    $admin = User::factory()->create();
    $admin->assignRole('super-admin');
    actingAs($admin);

    // 'Teacher' normalises to the existing system slug 'teacher'.
    $this->post('/roles', [
        'name' => 'Teacher',
        'permissions' => ['view-dashboard'],
    ])->assertSessionHasErrors('name');
});
