<?php

use App\Models\ActivityLog;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function auditTenant(): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => 'audit-school'],
        ['name' => 'Audit School', 'slug' => 'audit-school', 'email' => 'a@school.test', 'status' => 'active', 'subscription_plan' => 'free']
    );
}

function auditUser(string $role): User
{
    $user = User::factory()->create(['tenant_id' => auditTenant()->id]);
    $user->assignRole($role);

    return $user;
}

it('logs successful logins', function () {
    $user = auditUser('teacher');

    event(new Login('web', $user, false));

    expect(ActivityLog::where('action', 'auth.login')->where('user_id', $user->id)->exists())->toBeTrue();
});

it('logs failed login attempts without storing the password', function () {
    event(new Failed('web', null, ['email' => 'attacker@test.com', 'password' => 'secret']));

    $log = ActivityLog::where('action', 'auth.failed')->first();

    expect($log)->not->toBeNull();
    expect($log->properties['email'])->toBe('attacker@test.com');
    expect($log->properties)->not->toHaveKey('password');
});

it('logs role changes', function () {
    $admin = User::factory()->create();
    $admin->assignRole('super-admin');
    actingAs($admin);

    $this->post('/roles', ['name' => 'Audit Role', 'permissions' => ['view-dashboard']])->assertRedirect('/roles');

    expect(ActivityLog::where('action', 'role.created')->exists())->toBeTrue();
});

it('forbids the audit log for users without manage-settings', function () {
    actingAs(auditUser('teacher'));

    $this->get('/activity-logs')->assertForbidden();
});

it('shows the audit log to a school admin', function () {
    actingAs(auditUser('school-owner'));

    $this->get('/activity-logs')->assertOk();
});

it('scopes the audit log to the admin tenant', function () {
    $tenant = auditTenant();
    ActivityLog::create(['tenant_id' => 'some-other-tenant', 'action' => 'x.other', 'created_at' => now()]);
    ActivityLog::create(['tenant_id' => $tenant->id, 'action' => 'x.mine', 'created_at' => now()]);

    actingAs(auditUser('school-owner'));

    $this->get('/activity-logs')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('activity-logs/index')->has('logs', 1));
});
