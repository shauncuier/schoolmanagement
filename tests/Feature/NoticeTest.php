<?php

use App\Models\Notice;
use App\Models\NotificationLog;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function noticeTenant(string $id = 'notice-school'): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => $id],
        ['name' => 'Notice School', 'slug' => $id, 'email' => "info@{$id}.test", 'status' => 'active', 'subscription_plan' => 'free']
    );
}

function noticeUser(Tenant $tenant, string $role): User
{
    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole($role);

    return $user;
}

it('forbids notice creation for a teacher', function () {
    $tenant = noticeTenant();
    actingAs(noticeUser($tenant, 'teacher')); // view-notices but not create-notices

    $this->get('/notices/create')->assertForbidden();
});

it('lets an authorised user list and create notices', function () {
    $tenant = noticeTenant();
    actingAs(noticeUser($tenant, 'school-owner'));

    $this->get('/notices')->assertOk();

    $this->post('/notices', [
        'title' => 'Parent meeting',
        'content' => 'Parent-teacher meeting on Saturday.',
        'type' => 'announcement',
        'audience' => 'parents',
        'publish_date' => now()->toDateString(),
    ])->assertRedirect('/notices');

    expect(Notice::where('title', 'Parent meeting')->exists())->toBeTrue();
});

it('broadcasts an SMS when a notice is published with notification', function () {
    $tenant = noticeTenant();
    $recipient = User::factory()->create(['tenant_id' => $tenant->id, 'phone' => '01712345678']);
    $recipient->assignRole('student');

    actingAs(noticeUser($tenant, 'school-owner'));

    $this->post('/notices', [
        'title' => 'Holiday',
        'content' => 'School closed on Friday.',
        'type' => 'holiday',
        'audience' => 'all',
        'publish_date' => now()->toDateString(),
        'is_published' => true,
        'send_notification' => true,
    ])->assertRedirect('/notices');

    expect(NotificationLog::where('type', 'sms')->where('status', 'sent')->count())->toBeGreaterThan(0);
});

it('does not broadcast a draft notice', function () {
    $tenant = noticeTenant();
    $recipient = User::factory()->create(['tenant_id' => $tenant->id, 'phone' => '01712345678']);
    $recipient->assignRole('student');

    actingAs(noticeUser($tenant, 'school-owner'));

    $this->post('/notices', [
        'title' => 'Draft',
        'content' => 'Not yet published.',
        'type' => 'notice',
        'audience' => 'all',
        'publish_date' => now()->toDateString(),
        'is_published' => false,
        'send_notification' => true,
    ])->assertRedirect('/notices');

    expect(NotificationLog::count())->toBe(0);
});

it('requires a class when the audience is a specific class', function () {
    $tenant = noticeTenant();
    actingAs(noticeUser($tenant, 'school-owner'));

    $this->from('/notices/create')
        ->post('/notices', [
            'title' => 'Class notice',
            'content' => 'For one class.',
            'type' => 'notice',
            'audience' => 'specific_class',
            'publish_date' => now()->toDateString(),
        ])
        ->assertSessionHasErrors('class_id');
});

it('prevents editing a notice from another tenant', function () {
    $tenantA = noticeTenant('notice-a');
    $notice = Notice::create([
        'tenant_id' => $tenantA->id, 'title' => 'A', 'content' => 'x', 'type' => 'notice',
        'audience' => 'all', 'publish_date' => now(), 'created_by' => noticeUser($tenantA, 'admin-officer')->id,
    ]);

    $tenantB = noticeTenant('notice-b');
    actingAs(noticeUser($tenantB, 'school-owner'));

    $this->get("/notices/{$notice->id}/edit")->assertForbidden();
});
