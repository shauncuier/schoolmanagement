<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

class ActivityLogger
{
    /**
     * Record an audit-trail entry. Captures the acting user, tenant, request IP
     * and user agent automatically.
     */
    public function log(
        string $action,
        ?string $description = null,
        ?Model $subject = null,
        array $properties = [],
        ?Authenticatable $user = null,
    ): ActivityLog {
        $user = $user ?? auth()->user();
        $request = request();

        return ActivityLog::create([
            'tenant_id' => $user?->tenant_id,
            'user_id' => $user?->getAuthIdentifier(),
            'action' => $action,
            'description' => $description,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'properties' => $properties ?: null,
            'ip_address' => $request?->ip(),
            'user_agent' => mb_substr((string) $request?->userAgent(), 0, 512),
            'created_at' => now(),
        ]);
    }
}
