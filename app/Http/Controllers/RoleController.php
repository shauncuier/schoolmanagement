<?php

namespace App\Http\Controllers;

use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * System roles that cannot be deleted.
     */
    private array $systemRoles = [
        'super-admin',
        'school-owner',
        'principal',
        'vice-principal',
        'admin-officer',
        'academic-coordinator',
        'teacher',
        'class-teacher',
        'student',
        'parent',
        'accountant',
        'librarian',
        'transport-manager',
        'hostel-manager',
        'hr-manager',
        'it-support',
    ];

    /**
     * Display a listing of roles.
     */
    public function index(): Response
    {
        $roles = Role::withCount('users')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions->count(),
                    'is_system' => in_array($role->name, $this->systemRoles),
                    'created_at' => $role->created_at,
                ];
            });

        return Inertia::render('roles/index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        $permissions = $this->getGroupedPermissions();

        return Inertia::render('roles/create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,name',
        ]);

        // Normalise to a slug before persisting and check uniqueness against
        // that normalised value, otherwise two different inputs (e.g. "Test Role"
        // and "test-role") collapse to the same slug and hit a DB-level error.
        $name = Str::slug($validated['name']);

        if ($name === '') {
            return back()
                ->withErrors(['name' => 'Role name must contain letters or numbers.'])
                ->withInput();
        }

        if (Role::where('name', $name)->where('guard_name', 'web')->exists()) {
            return back()
                ->withErrors(['name' => 'A role with this name already exists.'])
                ->withInput();
        }

        $role = Role::create([
            'name' => $name,
            'guard_name' => 'web',
        ]);

        $role->syncPermissions($validated['permissions']);

        app(ActivityLogger::class)->log('role.created', "Created role '{$name}'", $role, [
            'permissions' => $validated['permissions'],
        ]);

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): Response
    {
        $permissions = $role->permissions->pluck('name')->toArray();
        $groupedPermissions = $this->getGroupedPermissions();

        // Mark which permissions are assigned
        foreach ($groupedPermissions as $group => $perms) {
            foreach ($perms as $index => $perm) {
                $groupedPermissions[$group][$index]['assigned'] = in_array($perm['name'], $permissions);
            }
        }

        return Inertia::render('roles/show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'is_system' => in_array($role->name, $this->systemRoles),
                'users_count' => $role->users()->count(),
                'created_at' => $role->created_at,
            ],
            'permissions' => $groupedPermissions,
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role): Response
    {
        $permissions = $this->getGroupedPermissions();
        $rolePermissions = $role->permissions->pluck('name')->toArray();

        // Mark which permissions are assigned
        foreach ($permissions as $group => $perms) {
            foreach ($perms as $index => $perm) {
                $permissions[$group][$index]['assigned'] = in_array($perm['name'], $rolePermissions);
            }
        }

        return Inertia::render('roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'is_system' => in_array($role->name, $this->systemRoles),
            ],
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,name',
        ]);

        // Don't allow changing super-admin permissions
        if ($role->name === 'super-admin') {
            return redirect()->back()
                ->with('error', 'Cannot modify super-admin permissions.');
        }

        $role->syncPermissions($validated['permissions']);

        app(ActivityLogger::class)->log('role.updated', "Updated permissions for '{$role->name}'", $role, [
            'permissions' => $validated['permissions'],
        ]);

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Check if it's a system role
        if (in_array($role->name, $this->systemRoles)) {
            return redirect()->back()
                ->with('error', 'System roles cannot be deleted.');
        }

        // Check if users are assigned
        if ($role->users()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete role with assigned users.');
        }

        $roleName = $role->name;
        $role->delete();

        app(ActivityLogger::class)->log('role.deleted', "Deleted role '{$roleName}'", null, ['name' => $roleName]);

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Get permissions grouped by module.
     */
    private function getGroupedPermissions(): array
    {
        $permissions = Permission::all();
        $grouped = [];

        foreach ($permissions as $permission) {
            // Extract module from permission name (e.g., 'view-students' -> 'students')
            $parts = explode('-', $permission->name);
            $action = $parts[0]; // view, create, edit, delete, manage
            $module = implode('-', array_slice($parts, 1)); // students, academic-years, etc.

            if (empty($module)) {
                $module = 'general';
            }

            // Format module name for display
            $moduleDisplay = ucwords(str_replace('-', ' ', $module));

            if (! isset($grouped[$moduleDisplay])) {
                $grouped[$moduleDisplay] = [];
            }

            $grouped[$moduleDisplay][] = [
                'name' => $permission->name,
                'action' => $action,
                'label' => ucfirst($action).' '.$moduleDisplay,
            ];
        }

        // Sort groups alphabetically
        ksort($grouped);

        return $grouped;
    }
}
