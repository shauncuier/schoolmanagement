<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    /**
     * Display a listing of teachers.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Build query
        $query = Teacher::query()->with(['user']);
        
        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        // Apply filters
        if ($request->filled('status')) {
            if ($request->input('status') === 'active') {
                $query->active();
            } else {
                $query->where('is_active', false);
            }
        }
        if ($request->filled('employment_type')) {
            $query->where('employment_type', $request->input('employment_type'));
        }
        if ($request->filled('department')) {
            $query->where('department', $request->input('department'));
        }
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('employee_id', 'like', "%{$search}%");
        }

        $teachers = $query->orderBy('employee_id')->paginate(20);

        // Get unique departments for filter
        $departmentQuery = Teacher::query()->whereNotNull('department')->distinct();
        if ($tenantId) {
            $departmentQuery->forTenant($tenantId);
        }
        $departments = $departmentQuery->pluck('department');

        return Inertia::render('teachers/index', [
            'teachers' => $teachers,
            'departments' => $departments,
            'filters' => [
                'status' => $request->input('status'),
                'employment_type' => $request->input('employment_type'),
                'department' => $request->input('department'),
                'search' => $request->input('search'),
            ],
        ]);
    }

    /**
     * Display the teacher profile.
     */
    public function show(Teacher $teacher): Response
    {
        $this->authorizeForTenant($teacher);

        $teacher->load([
            'user',
            'classesTaught.schoolClass',
            'attendances' => fn($q) => $q->latest()->take(30),
        ]);

        return Inertia::render('teachers/show', [
            'teacher' => $teacher,
        ]);
    }

    /**
     * Show the form for creating a new teacher.
     */
    public function create(): Response
    {
        return Inertia::render('teachers/create', [
            'availableRoles' => ['teacher', 'class-teacher'],
        ]);
    }

    /**
     * Store a newly created teacher.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:8', // Optional - defaults to password123
            'employee_id' => 'nullable|string|max:50',
            'designation' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'joining_date' => 'nullable|date',
            'qualification' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:500',
            'salary' => 'nullable|numeric|min:0',
            'employment_type' => 'required|in:full-time,part-time,contract,substitute',
            'role' => 'required|in:teacher,class-teacher',
        ]);

        $user = $request->user();

        // Create user account for teacher
        $password = $validated['password'] ?? 'password123';
        $teacherUser = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($password),
            'tenant_id' => $user->tenant_id,
        ]);
        $teacherUser->assignRole($validated['role']);

        // Create teacher record
        $teacherData = [
            'tenant_id' => $user->tenant_id,
            'user_id' => $teacherUser->id,
            'employment_type' => $validated['employment_type'],
            'is_active' => true,
        ];

        // Only add optional fields if they have values
        if (!empty($validated['employee_id'])) {
            $teacherData['employee_id'] = $validated['employee_id'];
        }
        if (!empty($validated['designation'])) {
            $teacherData['designation'] = $validated['designation'];
        }
        if (!empty($validated['department'])) {
            $teacherData['department'] = $validated['department'];
        }
        if (!empty($validated['joining_date'])) {
            $teacherData['joining_date'] = $validated['joining_date'];
        }
        if (!empty($validated['qualification'])) {
            $teacherData['qualification'] = $validated['qualification'];
        }
        if (!empty($validated['specialization'])) {
            $teacherData['specialization'] = $validated['specialization'];
        }
        if (!empty($validated['salary'])) {
            $teacherData['salary'] = $validated['salary'];
        }

        Teacher::create($teacherData);

        return redirect()->route('teachers.index')
            ->with('success', 'Teacher created successfully.');
    }

    /**
     * Show the form for editing a teacher.
     */
    public function edit(Teacher $teacher): Response
    {
        $this->authorizeForTenant($teacher);

        $teacher->load(['user.roles']);
        
        // Get the teacher's current role
        $currentRole = $teacher->user->roles->first()?->name ?? 'teacher';

        return Inertia::render('teachers/edit', [
            'teacher' => $teacher,
            'currentRole' => $currentRole,
            'availableRoles' => ['teacher', 'class-teacher'],
        ]);
    }

    /**
     * Update the specified teacher.
     */
    public function update(Request $request, Teacher $teacher): RedirectResponse
    {
        $this->authorizeForTenant($teacher);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $teacher->user_id,
            'employee_id' => 'nullable|string|max:50',
            'designation' => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'joining_date' => 'nullable|date',
            'qualification' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:500',
            'salary' => 'nullable|numeric|min:0',
            'employment_type' => 'required|in:full-time,part-time,contract,substitute',
            'is_active' => 'boolean',
            'role' => 'nullable|in:teacher,class-teacher',
        ]);

        // Update user
        $teacher->user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Update role if changed
        if (!empty($validated['role'])) {
            $teacher->user->syncRoles([$validated['role']]);
        }

        // Update teacher
        $teacher->update([
            'employee_id' => $validated['employee_id'] ?? null,
            'designation' => $validated['designation'] ?? null,
            'department' => $validated['department'] ?? null,
            'joining_date' => $validated['joining_date'] ?? null,
            'qualification' => $validated['qualification'] ?? null,
            'specialization' => $validated['specialization'] ?? null,
            'salary' => $validated['salary'] ?? null,
            'employment_type' => $validated['employment_type'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('teachers.show', $teacher)
            ->with('success', 'Teacher updated successfully.');
    }

    /**
     * Remove the specified teacher.
     */
    public function destroy(Teacher $teacher): RedirectResponse
    {
        $this->authorizeForTenant($teacher);

        $teacher->delete();

        return redirect()->route('teachers.index')
            ->with('success', 'Teacher deleted successfully.');
    }

    /**
     * Ensure the teacher belongs to the user's tenant.
     */
    private function authorizeForTenant(Teacher $teacher): void
    {
        $user = request()->user();

        // Super-admin can access all
        if ($user->tenant_id === null) {
            return;
        }

        if ($teacher->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access to this teacher.');
        }
    }
}
