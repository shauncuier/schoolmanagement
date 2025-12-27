<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin();

        $query = User::query()
            ->with(['tenant', 'roles'])
            ->withTrashed();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // School/Tenant filter
        if ($request->filled('tenant_id') && $request->get('tenant_id') !== 'all') {
            if ($request->get('tenant_id') === 'platform') {
                $query->whereNull('tenant_id');
            } else {
                $query->where('tenant_id', $request->get('tenant_id'));
            }
        }

        // Role filter
        if ($request->filled('role') && $request->get('role') !== 'all') {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->get('role'));
            });
        }

        // Status filter
        if ($request->filled('status') && $request->get('status') !== 'all') {
            if ($request->get('status') === 'deleted') {
                $query->onlyTrashed();
            } else {
                $query->where('status', $request->get('status'));
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get all tenants for filter dropdown
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);

        // Get all roles for filter dropdown
        $roles = Role::orderBy('name')->get(['id', 'name']);

        // Statistics
        $stats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'inactive' => User::where('status', 'inactive')->count(),
            'platform_users' => User::whereNull('tenant_id')->count(),
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'tenants' => $tenants,
            'roles' => $roles,
            'stats' => $stats,
            'filters' => $request->only(['search', 'tenant_id', 'role', 'status']),
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(string $id): Response
    {
        $this->authorizeSuperAdmin();

        $user = User::with(['tenant', 'roles', 'student', 'teacher', 'guardian'])
            ->withTrashed()
            ->findOrFail($id);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(string $id): Response
    {
        $this->authorizeSuperAdmin();

        $user = User::with(['tenant', 'roles'])->findOrFail($id);
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'tenants' => $tenants,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive,suspended',
            'tenant_id' => 'nullable|exists:tenants,id',
            'role' => 'required|exists:roles,name',
            'password' => 'nullable|string|min:8',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? $user->phone,
            'status' => $validated['status'],
            'tenant_id' => $validated['tenant_id'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        // Sync role
        $user->syncRoles([$validated['role']]);

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Toggle user status.
     */
    public function toggleStatus(Request $request, string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user->update(['status' => $validated['status']]);

        return redirect()->back()
            ->with('success', "User status changed to {$validated['status']}.");
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return redirect()->back()
            ->with('success', 'User restored successfully.');
    }

    /**
     * Force delete a user permanently.
     */
    public function forceDelete(string $id): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $user = User::onlyTrashed()->findOrFail($id);
        $user->forceDelete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User permanently deleted.');
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
