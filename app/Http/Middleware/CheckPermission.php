<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     * Check if user has the required permission.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$permissions
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Unauthorized access.');
        }

        // Super admin bypasses all permission checks
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Check if user has any of the required permissions
        if (!$user->hasAnyPermission($permissions)) {
            abort(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
