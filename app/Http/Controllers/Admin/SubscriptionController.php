<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of all subscriptions.
     */
    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin();

        $query = Tenant::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Plan filter
        if ($request->filled('plan') && $request->get('plan') !== 'all') {
            $query->where('subscription_plan', $request->get('plan'));
        }

        // Status filter (subscription status: active, expired, trial)
        if ($request->filled('subscription_status') && $request->get('subscription_status') !== 'all') {
            $status = $request->get('subscription_status');
            if ($status === 'expired') {
                $query->where('subscription_ends_at', '<', now());
            } elseif ($status === 'expiring_soon') {
                $query->whereBetween('subscription_ends_at', [now(), now()->addDays(30)]);
            } elseif ($status === 'active') {
                $query->where(function ($q) {
                    $q->where('subscription_ends_at', '>', now())
                        ->orWhereNull('subscription_ends_at')
                        ->orWhere('subscription_plan', 'free');
                });
            }
        }

        $subscriptions = $query->orderBy('subscription_ends_at', 'asc')->paginate(15);

        // Add computed fields
        $subscriptions->getCollection()->transform(function ($tenant) {
            $tenant->is_expired = $tenant->subscription_ends_at && $tenant->subscription_ends_at->isPast();
            $tenant->days_until_expiry = $tenant->subscription_ends_at
                ? now()->diffInDays($tenant->subscription_ends_at, false)
                : null;
            $tenant->users_count = $tenant->users()->count();

            return $tenant;
        });

        // Statistics
        $stats = [
            'total' => Tenant::count(),
            'free' => Tenant::where('subscription_plan', 'free')->count(),
            'basic' => Tenant::where('subscription_plan', 'basic')->count(),
            'standard' => Tenant::where('subscription_plan', 'standard')->count(),
            'premium' => Tenant::where('subscription_plan', 'premium')->count(),
            'expiring_soon' => Tenant::whereBetween('subscription_ends_at', [now(), now()->addDays(30)])->count(),
            'expired' => Tenant::where('subscription_ends_at', '<', now())->count(),
        ];

        // Plan options for dropdown
        $plans = [
            ['value' => 'free', 'label' => 'Free', 'price' => 0, 'features' => ['Up to 100 students', 'Basic reporting', 'Email support']],
            ['value' => 'basic', 'label' => 'Basic', 'price' => 999, 'features' => ['Up to 500 students', 'Advanced reporting', 'Priority support']],
            ['value' => 'standard', 'label' => 'Standard', 'price' => 2499, 'features' => ['Up to 2000 students', 'All features', 'Phone support']],
            ['value' => 'premium', 'label' => 'Premium', 'price' => 4999, 'features' => ['Unlimited students', 'Custom features', 'Dedicated support']],
        ];

        return Inertia::render('admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'stats' => $stats,
            'plans' => $plans,
            'filters' => $request->only(['search', 'plan', 'subscription_status']),
        ]);
    }

    /**
     * Update subscription for a tenant.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'subscription_plan' => 'required|in:free,basic,standard,premium',
            'subscription_ends_at' => 'nullable|date|after:today',
        ]);

        $tenant->update([
            'subscription_plan' => $validated['subscription_plan'],
            'subscription_ends_at' => $validated['subscription_ends_at'] ?? null,
        ]);

        return redirect()->back()
            ->with('success', "Subscription updated for {$tenant->name}.");
    }

    /**
     * Extend subscription for a tenant.
     */
    public function extend(Request $request, string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $currentEnd = $tenant->subscription_ends_at ?? now();
        if ($currentEnd->isPast()) {
            $currentEnd = now();
        }

        $tenant->update([
            'subscription_ends_at' => $currentEnd->addDays($validated['days']),
        ]);

        return redirect()->back()
            ->with('success', "Subscription extended by {$validated['days']} days for {$tenant->name}.");
    }

    /**
     * Cancel subscription (set to free plan).
     */
    public function cancel(string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'subscription_plan' => 'free',
            'subscription_ends_at' => null,
        ]);

        return redirect()->back()
            ->with('success', "Subscription cancelled for {$tenant->name}. Reverted to free plan.");
    }

    /**
     * Authorize that the current user is a super-admin.
     */
    private function authorizeSuperAdmin(): void
    {
        $user = request()->user();

        if (! $user || $user->tenant_id !== null) {
            abort(403, 'Only super-admin can access this resource.');
        }

        if (! $user->hasRole('super-admin')) {
            abort(403, 'Only super-admin can access this resource.');
        }
    }
}
