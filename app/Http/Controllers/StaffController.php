<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    /**
     * Display a listing of staff members.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Build query for users who are staff (not student/parent/teacher)
        $staffRoles = ['admin', 'school-owner', 'principal', 'vice-principal', 'academic-coordinator', 'admin-officer', 'accountant', 'librarian', 'transport-manager', 'hostel-manager', 'inventory-manager', 'it-support', 'hr-manager'];
        
        $query = User::query()
            ->whereHas('roles', fn($q) => $q->whereIn('name', $staffRoles));
        
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        // Apply filters
        if ($request->filled('role')) {
            $query->whereHas('roles', fn($q) => $q->where('name', $request->input('role')));
        }
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $staff = $query->with('roles')->orderBy('name')->paginate(20);

        // Get available staff roles for filter
        $roles = Role::whereIn('name', $staffRoles)->pluck('name');

        return Inertia::render('staff/index', [
            'staff' => $staff,
            'roles' => $roles,
            'filters' => [
                'role' => $request->input('role'),
                'search' => $request->input('search'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new staff member.
     */
    public function create(): Response
    {
        $staffRoles = ['admin', 'school-owner', 'principal', 'vice-principal', 'academic-coordinator', 'admin-officer', 'accountant', 'librarian', 'transport-manager', 'hostel-manager', 'inventory-manager', 'it-support', 'hr-manager'];
        $roles = Role::whereIn('name', $staffRoles)->pluck('name');

        return Inertia::render('staff/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created staff member.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'role' => 'required|exists:roles,name',
        ]);

        $user = $request->user();
        $password = $validated['password'] ?? 'password123';

        // Create staff user
        $staffUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => bcrypt($password),
            'tenant_id' => $user->tenant_id,
        ]);
        $staffUser->assignRole($validated['role']);

        return redirect()->route('staff.index')
            ->with('success', 'Staff member created successfully.');
    }

    /**
     * Show the form for editing a staff member.
     */
    public function edit(User $staff): Response
    {
        $this->authorizeForTenant($staff);

        $staffRoles = ['admin', 'school-owner', 'principal', 'vice-principal', 'academic-coordinator', 'admin-officer', 'accountant', 'librarian', 'transport-manager', 'hostel-manager', 'inventory-manager', 'it-support', 'hr-manager'];
        $roles = Role::whereIn('name', $staffRoles)->pluck('name');

        $staff->load('roles');
        $currentRole = $staff->roles->first()?->name ?? '';

        return Inertia::render('staff/edit', [
            'staff' => $staff,
            'roles' => $roles,
            'currentRole' => $currentRole,
        ]);
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, User $staff): RedirectResponse
    {
        $this->authorizeForTenant($staff);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $staff->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'required|exists:roles,name',
        ]);

        $staff->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ]);

        $staff->syncRoles([$validated['role']]);

        return redirect()->route('staff.index')
            ->with('success', 'Staff member updated successfully.');
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy(User $staff): RedirectResponse
    {
        $this->authorizeForTenant($staff);

        // Don't allow deleting yourself
        if ($staff->id === request()->user()->id) {
            return redirect()->back()
                ->with('error', 'You cannot delete your own account.');
        }

        $staff->delete();

        return redirect()->route('staff.index')
            ->with('success', 'Staff member deleted successfully.');
    }

    /**
     * Ensure the staff belongs to the user's tenant.
     */
    private function authorizeForTenant(User $staff): void
    {
        $user = request()->user();

        if ($user->tenant_id === null) {
            return;
        }

        if ($staff->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access to this staff member.');
        }
    }
}
