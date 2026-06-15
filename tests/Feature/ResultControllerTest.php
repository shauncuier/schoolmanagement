<?php

use App\Models\Tenant;
use App\Models\User;
use App\Services\ResultService;
use Database\Seeders\RolePermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function publisher(Tenant $tenant, string $role = 'school-owner'): User
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole($role);

    return $user;
}

it('forbids result publishing for users without publish-results', function () {
    $tenant = resultTenant();
    actingAs(publisher($tenant, 'teacher')); // teacher lacks publish-results

    $this->get('/exams/results')->assertForbidden();
});

it('lets an authorised user open the results console', function () {
    $tenant = resultTenant();
    buildResultScenario($tenant);
    actingAs(publisher($tenant, 'school-owner'));

    $this->get('/exams/results')->assertOk();
});

it('publishes an exam from the admin endpoint', function () {
    $tenant = resultTenant();
    ['exam' => $exam] = buildResultScenario($tenant);
    actingAs(publisher($tenant, 'school-owner'));

    $this->post("/exams/{$exam->id}/publish")->assertRedirect();

    expect($exam->fresh()->is_published)->toBeTrue();
});

it('prevents publishing an exam from another tenant', function () {
    $tenantA = resultTenant('school-a');
    ['exam' => $examA] = buildResultScenario($tenantA);

    $tenantB = resultTenant('school-b');
    actingAs(publisher($tenantB, 'school-owner'));

    $this->post("/exams/{$examA->id}/publish")->assertForbidden();
    expect($examA->fresh()->is_published)->toBeFalse();
});

it('renders the public lookup page', function () {
    $tenant = resultTenant();

    $this->get("/results/{$tenant->slug}")->assertOk();
});

it('returns a published result via public lookup', function () {
    $tenant = resultTenant();
    ['exam' => $exam] = buildResultScenario($tenant);
    app(ResultService::class)->publish($exam);

    $this->post("/results/{$tenant->slug}", ['exam_id' => $exam->id, 'roll' => '7'])
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/results')
            ->where('result.student.roll', '7')
            ->where('result.summary.result', 'pass')
        );
});

it('does not expose an unpublished result via public lookup', function () {
    $tenant = resultTenant();
    ['exam' => $exam] = buildResultScenario($tenant);

    $this->post("/results/{$tenant->slug}", ['exam_id' => $exam->id, 'roll' => '7'])
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/results')
            ->where('result', null)
        );
});
