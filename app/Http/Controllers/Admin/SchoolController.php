<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Stancl\Tenancy\Database\Models\Domain;

class SchoolController extends Controller
{
    /**
     * Ensure only super-admin can access these routes.
     */
    public function __construct()
    {
        // Super-admin check will be done in each method
    }

    /**
     * Display a listing of schools (tenants).
     */
    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin();

        $query = Tenant::query()->with('domains');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Subscription filter
        if ($request->filled('plan') && $request->get('plan') !== 'all') {
            $query->where('subscription_plan', $request->get('plan'));
        }

        $schools = $query->orderBy('created_at', 'desc')->paginate(12);

        // Add statistics to each school
        $schools->getCollection()->transform(function ($school) {
            $school->stats = [
                'users_count' => User::where('tenant_id', $school->id)->count(),
                'students_count' => Student::where('tenant_id', $school->id)->count(),
                'teachers_count' => Teacher::where('tenant_id', $school->id)->count(),
            ];
            $school->primary_domain = $school->domains->first()?->domain;

            return $school;
        });

        // Summary statistics
        $stats = [
            'total' => Tenant::count(),
            'active' => Tenant::where('status', 'active')->count(),
            'pending' => Tenant::where('status', 'pending')->count(),
            'suspended' => Tenant::where('status', 'suspended')->count(),
        ];

        return Inertia::render('admin/schools/index', [
            'schools' => $schools,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'plan']),
        ]);
    }

    /**
     * Show the form for creating a new school.
     */
    public function create(): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/schools/create');
    }

    /**
     * Store a newly created school.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:tenants,slug',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'subscription_plan' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive,pending,suspended',
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Generate tenant ID
            $tenantId = Str::uuid()->toString();

            // Create tenant
            $tenant = Tenant::create([
                'id' => $tenantId,
                'name' => $validated['name'],
                'slug' => Str::slug($validated['slug']),
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'website' => $validated['website'] ?? null,
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'country' => $validated['country'] ?? 'Bangladesh',
                'postal_code' => $validated['postal_code'] ?? null,
                'primary_color' => $validated['primary_color'] ?? '#3b82f6',
                'secondary_color' => $validated['secondary_color'] ?? '#1e40af',
                'subscription_plan' => $validated['subscription_plan'] ?? 'free',
                'status' => $validated['status'] ?? 'pending',
            ]);

            // Create domain for the tenant
            $domain = Str::slug($validated['slug']).'.'.config('app.domain', 'localhost');
            Domain::create([
                'domain' => $domain,
                'tenant_id' => $tenant->id,
            ]);
        });

        return redirect()->route('admin.schools.index')
            ->with('success', 'School created successfully.');
    }

    /**
     * Display the specified school.
     */
    public function show(string $id): Response
    {
        $this->authorizeSuperAdmin();

        $school = Tenant::with('domains')->findOrFail($id);

        // Get detailed statistics
        $stats = [
            'users_count' => User::where('tenant_id', $school->id)->count(),
            'students_count' => Student::where('tenant_id', $school->id)->count(),
            'teachers_count' => Teacher::where('tenant_id', $school->id)->count(),
            'classes_count' => DB::table('classes')->where('tenant_id', $school->id)->count(),
            'sections_count' => DB::table('sections')->where('tenant_id', $school->id)->count(),
        ];

        $school->stats = $stats;
        $school->primary_domain = $school->domains->first()?->domain;

        // Recent users
        $recentUsers = User::where('tenant_id', $school->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'email', 'created_at']);

        return Inertia::render('admin/schools/show', [
            'school' => $school,
            'recentUsers' => $recentUsers,
        ]);
    }

    /**
     * Show the form for editing the specified school.
     */
    public function edit(string $id): Response
    {
        $this->authorizeSuperAdmin();

        $school = Tenant::with('domains')->findOrFail($id);
        $school->primary_domain = $school->domains->first()?->domain;

        return Inertia::render('admin/schools/edit', [
            'school' => $school,
        ]);
    }

    /**
     * Update the specified school.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $school = Tenant::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:100', Rule::unique('tenants', 'slug')->ignore($school->id)],
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'subscription_plan' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive,pending,suspended',
        ]);

        $school->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['slug']),
            'email' => $validated['email'] ?? $school->email,
            'phone' => $validated['phone'] ?? $school->phone,
            'website' => $validated['website'] ?? $school->website,
            'address' => $validated['address'] ?? $school->address,
            'city' => $validated['city'] ?? $school->city,
            'state' => $validated['state'] ?? $school->state,
            'country' => $validated['country'] ?? $school->country,
            'postal_code' => $validated['postal_code'] ?? $school->postal_code,
            'primary_color' => $validated['primary_color'] ?? $school->primary_color,
            'secondary_color' => $validated['secondary_color'] ?? $school->secondary_color,
            'subscription_plan' => $validated['subscription_plan'] ?? $school->subscription_plan,
            'status' => $validated['status'] ?? $school->status,
        ]);

        return redirect()->route('admin.schools.index')
            ->with('success', 'School updated successfully.');
    }

    /**
     * Remove the specified school (soft delete).
     */
    public function destroy(string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $school = Tenant::findOrFail($id);

        // Check if school has users
        $usersCount = User::where('tenant_id', $school->id)->count();
        if ($usersCount > 0) {
            return redirect()->route('admin.schools.index')
                ->with('error', "Cannot delete school with {$usersCount} users. Please remove all users first.");
        }

        $school->delete();

        return redirect()->route('admin.schools.index')
            ->with('success', 'School deleted successfully.');
    }

    /**
     * Toggle school status.
     */
    public function toggleStatus(Request $request, string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $school = Tenant::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:active,inactive,pending,suspended',
        ]);

        $school->update(['status' => $validated['status']]);

        return redirect()->back()
            ->with('success', "School status changed to {$validated['status']}.");
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
