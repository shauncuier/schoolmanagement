<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantSession
{
    /**
     * Handle an incoming request.
     * Ensures that tenant-specific routes have proper tenant context.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Skip for super admins (they can access all tenants)
        if ($user && $user->isSuperAdmin()) {
            return $next($request);
        }

        // For regular users, ensure they have a tenant
        if ($user && !$user->tenant_id) {
            abort(403, 'User is not associated with any school.');
        }

        // Check if tenant is active
        if ($user && $user->tenant && !$user->tenant->isActive()) {
            abort(403, 'Your school account is currently inactive. Please contact support.');
        }

        // Check subscription
        if ($user && $user->tenant && !$user->tenant->hasActiveSubscription()) {
            abort(403, 'Your school subscription has expired. Please renew to continue.');
        }

        return $next($request);
    }
}
