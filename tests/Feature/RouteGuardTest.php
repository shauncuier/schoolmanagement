<?php

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function guardUser(string $role): User
{
    $tenant = Tenant::firstOrCreate(
        ['id' => 'guard-school'],
        ['name' => 'Guard School', 'slug' => 'guard-school', 'email' => 'g@school.test', 'status' => 'active', 'subscription_plan' => 'free']
    );
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole($role);

    return $user;
}

it('blocks a student from the students admin module', function () {
    actingAs(guardUser('student')); // student lacks view-students

    $this->get('/students')->assertForbidden();
});

it('blocks a student from classes and subjects', function () {
    actingAs(guardUser('student'));

    $this->get('/classes')->assertForbidden();
    $this->get('/subjects')->assertForbidden();
});

it('allows a teacher into the students module', function () {
    actingAs(guardUser('teacher')); // teacher has view-students

    $this->get('/students')->assertOk();
});

it('blocks a student from the teachers module', function () {
    actingAs(guardUser('student')); // student lacks view-teachers

    $this->get('/teachers')->assertForbidden();
});
