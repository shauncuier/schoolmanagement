<?php

namespace App\Services;

use App\Models\Notice;
use App\Models\Tenant;
use App\Models\User;
use App\Services\Sms\SmsService;
use Illuminate\Support\Str;

class NoticeService
{
    public function __construct(private readonly SmsService $sms) {}

    /**
     * SMS-broadcast a published notice to its audience. Returns the number sent.
     */
    public function broadcast(Notice $notice): int
    {
        if (! $notice->is_published || ! $notice->send_notification) {
            return 0;
        }

        $tenant = Tenant::find($notice->tenant_id);
        if (! $tenant) {
            return 0;
        }

        $phones = $this->audienceQuery($notice)->pluck('phone')->all();
        if (empty($phones)) {
            return 0;
        }

        $body = $notice->title.' - '.Str::limit(strip_tags($notice->content), 250);

        return $this->sms->sendBulk($tenant, $phones, $body)['sent'];
    }

    /**
     * Tenant-scoped users (with a phone) for a notice's audience.
     */
    private function audienceQuery(Notice $notice)
    {
        $query = User::where('tenant_id', $notice->tenant_id)->whereNotNull('phone');

        return match ($notice->audience) {
            'students' => $query->whereHas('roles', fn ($r) => $r->where('name', 'student')),
            'teachers' => $query->whereHas('roles', fn ($r) => $r->whereIn('name', ['teacher', 'class-teacher'])),
            'parents' => $query->whereHas('roles', fn ($r) => $r->where('name', 'parent')),
            'staff' => $query->whereHas('roles', fn ($r) => $r->whereIn('name', ['accountant', 'librarian', 'admin-officer', 'hr-manager', 'it-support'])),
            'specific_class' => $query->whereHas('student', fn ($s) => $s->where('class_id', $notice->class_id)),
            default => $query, // all
        };
    }
}
