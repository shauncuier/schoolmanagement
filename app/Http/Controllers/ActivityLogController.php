<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Show the audit trail. Tenant admins see their school's activity;
     * the platform super-admin (tenant_id null) sees everything.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = ActivityLog::query()->with('user:id,name')->latest('created_at');

        if ($user->tenant_id !== null) {
            $query->where('tenant_id', $user->tenant_id);
        }

        $logs = $query->limit(200)->get()->map(fn (ActivityLog $log) => [
            'id' => $log->id,
            'action' => $log->action,
            'description' => $log->description,
            'user' => $log->user?->name,
            'ip_address' => $log->ip_address,
            'properties' => $log->properties,
            'created_at' => $log->created_at,
        ]);

        return Inertia::render('activity-logs/index', ['logs' => $logs]);
    }
}
