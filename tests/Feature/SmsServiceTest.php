<?php

use App\Models\NotificationLog;
use App\Models\Tenant;
use App\Services\Sms\Drivers\LogDriver;
use App\Services\Sms\SmsService;

function smsTenant(): Tenant
{
    return Tenant::firstOrCreate(
        ['id' => 'sms-school'],
        [
            'name' => 'SMS School',
            'slug' => 'sms-school',
            'email' => 'info@sms-school.test',
            'status' => 'active',
            'subscription_plan' => 'free',
        ]
    );
}

beforeEach(function () {
    $this->sms = app(SmsService::class);
});

it('detects GSM vs unicode encoding', function () {
    expect($this->sms->encoding('Hello world'))->toBe('gsm');
    expect($this->sms->encoding('পরীক্ষার ফলাফল'))->toBe('unicode');
});

it('counts GSM-7 segments', function () {
    expect($this->sms->countSegments(str_repeat('a', 160)))->toBe(1);
    expect($this->sms->countSegments(str_repeat('a', 161)))->toBe(2);
});

it('counts unicode (Bangla) segments at the smaller limit', function () {
    expect($this->sms->countSegments(str_repeat('ক', 70)))->toBe(1);
    expect($this->sms->countSegments(str_repeat('ক', 71)))->toBe(2);
});

it('normalises Bangladeshi numbers to 880 form', function () {
    expect($this->sms->normalizeNumber('01712345678'))->toBe('8801712345678');
    expect($this->sms->normalizeNumber('+8801712345678'))->toBe('8801712345678');
    expect($this->sms->normalizeNumber('8801712345678'))->toBe('8801712345678');
    expect($this->sms->normalizeNumber('1712345678'))->toBe('8801712345678');
});

it('validates Bangladeshi mobile numbers', function () {
    expect($this->sms->isValidNumber('01712345678'))->toBeTrue();
    expect($this->sms->isValidNumber('01912345678'))->toBeTrue();
    expect($this->sms->isValidNumber('0171234'))->toBeFalse();
    expect($this->sms->isValidNumber('01112345678'))->toBeFalse();
});

it('renders template placeholders', function () {
    expect($this->sms->render('{{name}} owes {amount}', ['name' => 'Karim', 'amount' => 500]))
        ->toBe('Karim owes 500');
});

it('estimates cost from segments', function () {
    expect($this->sms->estimateCost(str_repeat('a', 161)))->toBe(round(2 * config('sms.cost_per_segment'), 4));
});

it('defaults to the log driver', function () {
    expect($this->sms->driverFor(smsTenant()))->toBeInstanceOf(LogDriver::class);
});

it('logs a sent message with segment and cost metadata', function () {
    $tenant = smsTenant();

    $log = $this->sms->send($tenant, '01712345678', 'Hello');

    expect($log->status)->toBe('sent');
    expect($log->provider)->toBe('log');
    expect($log->recipient)->toBe('8801712345678');
    expect($log->segments)->toBe(1);
    expect((float) $log->cost)->toBe(round(config('sms.cost_per_segment'), 4));
    expect($log->sent_at)->not->toBeNull();
    expect($log->tenant_id)->toBe($tenant->id);
});

it('deduplicates recipients in a bulk send', function () {
    $tenant = smsTenant();

    $result = $this->sms->sendBulk($tenant, ['01712345678', '01712345678', '01812345678'], 'Hi');

    expect($result['sent'])->toBe(2);
    expect($result['failed'])->toBe(0);
    expect(NotificationLog::forTenant($tenant->id)->count())->toBe(2);
});
