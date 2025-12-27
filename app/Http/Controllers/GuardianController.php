<?php

namespace App\Http\Controllers;

use App\Models\Guardian;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuardianController extends Controller
{
    /**
     * Display a listing of guardians (parents).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Build query
        $query = Guardian::query()->with(['user', 'students']);
        
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
        if ($request->filled('relation_type')) {
            $query->where('relation_type', $request->input('relation_type'));
        }
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $guardians = $query->orderBy('id', 'desc')->paginate(20);

        return Inertia::render('guardians/index', [
            'guardians' => $guardians,
            'filters' => [
                'status' => $request->input('status'),
                'relation_type' => $request->input('relation_type'),
                'search' => $request->input('search'),
            ],
        ]);
    }

    /**
     * Display the guardian profile.
     */
    public function show(Guardian $guardian): Response
    {
        $this->authorizeForTenant($guardian);

        $guardian->load(['user', 'students.section.schoolClass']);

        return Inertia::render('guardians/show', [
            'guardian' => $guardian,
        ]);
    }

    /**
     * Show the form for creating a new guardian.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;
        
        // Get available students for linking
        $studentsQuery = Student::query()->with(['section.schoolClass']);
        if ($tenantId) {
            $studentsQuery->where('tenant_id', $tenantId);
        }
        $students = $studentsQuery->where('is_active', true)->get();

        return Inertia::render('guardians/create', [
            'relationTypes' => ['father', 'mother', 'guardian', 'uncle', 'aunt', 'grandparent', 'other'],
            'students' => $students,
        ]);
    }

    /**
     * Store a newly created guardian.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'occupation' => 'nullable|string|max:100',
            'workplace' => 'nullable|string|max:200',
            'annual_income' => 'nullable|numeric|min:0',
            'relation_type' => 'required|in:father,mother,guardian,uncle,aunt,grandparent,other',
            'is_primary_contact' => 'boolean',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        $user = $request->user();

        // Create user account for guardian
        $password = $validated['password'] ?? 'password123';
        $guardianUser = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => bcrypt($password),
            'tenant_id' => $user->tenant_id,
        ]);
        $guardianUser->assignRole('parent');

        // Create guardian record
        $guardianData = [
            'tenant_id' => $user->tenant_id,
            'user_id' => $guardianUser->id,
            'relation_type' => $validated['relation_type'],
            'is_primary_contact' => $validated['is_primary_contact'] ?? false,
            'is_active' => true,
        ];

        if (!empty($validated['occupation'])) {
            $guardianData['occupation'] = $validated['occupation'];
        }
        if (!empty($validated['workplace'])) {
            $guardianData['workplace'] = $validated['workplace'];
        }
        if (!empty($validated['annual_income'])) {
            $guardianData['annual_income'] = $validated['annual_income'];
        }

        $guardian = Guardian::create($guardianData);

        // Link students (children)
        if (!empty($validated['student_ids'])) {
            $guardian->students()->attach($validated['student_ids'], [
                'relationship' => $validated['relation_type'],
                'is_emergency_contact' => $validated['is_primary_contact'] ?? false,
                'can_pickup' => true,
            ]);
        }

        return redirect()->route('guardians.index')
            ->with('success', 'Parent/Guardian created successfully.');
    }

    /**
     * Show the form for editing a guardian.
     */
    public function edit(Request $request, Guardian $guardian): Response
    {
        $this->authorizeForTenant($guardian);

        $guardian->load(['user', 'students']);
        
        $user = $request->user();
        $tenantId = $user->tenant_id;
        
        // Get available students for linking
        $studentsQuery = Student::query()->with(['section.schoolClass']);
        if ($tenantId) {
            $studentsQuery->where('tenant_id', $tenantId);
        }
        $students = $studentsQuery->where('is_active', true)->get();

        return Inertia::render('guardians/edit', [
            'guardian' => $guardian,
            'relationTypes' => ['father', 'mother', 'guardian', 'uncle', 'aunt', 'grandparent', 'other'],
            'students' => $students,
            'linkedStudentIds' => $guardian->students->pluck('id')->toArray(),
        ]);
    }

    /**
     * Update the specified guardian.
     */
    public function update(Request $request, Guardian $guardian): RedirectResponse
    {
        $this->authorizeForTenant($guardian);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $guardian->user_id,
            'phone' => 'nullable|string|max:20',
            'occupation' => 'nullable|string|max:100',
            'workplace' => 'nullable|string|max:200',
            'annual_income' => 'nullable|numeric|min:0',
            'relation_type' => 'required|in:father,mother,guardian,uncle,aunt,grandparent,other',
            'is_primary_contact' => 'boolean',
            'is_active' => 'boolean',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        // Update user
        $guardian->user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ]);

        // Update guardian
        $guardian->update([
            'occupation' => $validated['occupation'] ?? null,
            'workplace' => $validated['workplace'] ?? null,
            'annual_income' => $validated['annual_income'] ?? null,
            'relation_type' => $validated['relation_type'],
            'is_primary_contact' => $validated['is_primary_contact'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Sync students (children)
        $pivotData = [];
        foreach ($validated['student_ids'] ?? [] as $studentId) {
            $pivotData[$studentId] = [
                'relationship' => $validated['relation_type'],
                'is_emergency_contact' => $validated['is_primary_contact'] ?? false,
                'can_pickup' => true,
            ];
        }
        $guardian->students()->sync($pivotData);

        return redirect()->route('guardians.show', $guardian)
            ->with('success', 'Parent/Guardian updated successfully.');
    }

    /**
     * Remove the specified guardian.
     */
    public function destroy(Guardian $guardian): RedirectResponse
    {
        $this->authorizeForTenant($guardian);

        // Check if guardian has linked students
        if ($guardian->students()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete guardian with linked students.');
        }

        $guardian->delete();

        return redirect()->route('guardians.index')
            ->with('success', 'Parent/Guardian deleted successfully.');
    }

    /**
     * Ensure the guardian belongs to the user's tenant.
     */
    private function authorizeForTenant(Guardian $guardian): void
    {
        $user = request()->user();

        if ($user->tenant_id === null) {
            return;
        }

        if ($guardian->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access to this guardian.');
        }
    }
}
