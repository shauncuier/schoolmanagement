<?php

use App\Models\NotificationLog;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function smsUser(string $role): User
{
    $tenant = Tenant::firstOrCreate(
        ['id' => 'sms-school'],
        [
            'name' => 'SMS School',
            'slug' => 'sms-school',
            'email' => 'info@sms-school.test',
            'status' => 'active',
            'subscription_plan' => 'free',
        ]
    );

    $user = User::factory()->create(['tenant_id' => $tenant->id]);
    $user->assignRole($role);

    return $user;
}

it('redirects guests from the sms console', function () {
    $this->get('/communication/sms')->assertRedirect('/login');
});

it('forbids users without send-notifications permission', function () {
    actingAs(smsUser('teacher')); // teacher lacks send-notifications

    $this->get('/communication/sms')->assertForbidden();
});

it('lets an authorised user open the sms console', function () {
    actingAs(smsUser('school-owner'));

    $this->get('/communication/sms')->assertOk();
});

it('sends to valid numbers and logs them', function () {
    actingAs(smsUser('school-owner'));

    $this->post('/communication/sms/send', [
        'recipients' => '01712345678, 01812345678',
        'body' => 'Class is cancelled tomorrow.',
    ])->assertRedirect();

    expect(NotificationLog::where('status', 'sent')->count())->toBe(2);
});

it('rejects invalid numbers without sending', function () {
    actingAs(smsUser('school-owner'));

    $this->from('/communication/sms')
        ->post('/communication/sms/send', [
            'recipients' => '01712345678, 12345',
            'body' => 'Hi',
        ])
        ->assertSessionHasErrors('recipients');

    expect(NotificationLog::count())->toBe(0);
});

it('blocks sms provider configuration for users without manage-settings', function () {
    // principal can send notifications but cannot manage settings.
    actingAs(smsUser('principal'));

    $this->put('/communication/sms/settings', [
        'provider' => 'log',
        'sender_id' => 'SCHOOL',
    ])->assertForbidden();
});

it('lets an admin configure sms and encrypts secrets', function () {
    $user = smsUser('school-owner');
    actingAs($user);

    $this->put('/communication/sms/settings', [
        'provider' => 'log',
        'sender_id' => 'SCHOOL',
        'api_key' => 'secret-key-123',
    ])->assertRedirect();

    $tenant = $user->tenant->fresh();
    expect($tenant->getSetting('sms.sender_id'))->toBe('SCHOOL');
    expect(decrypt($tenant->getSetting('sms.api_key')))->toBe('secret-key-123');
});
