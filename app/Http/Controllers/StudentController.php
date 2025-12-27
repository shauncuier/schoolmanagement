<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Build query
        $query = Student::query()->with(['user', 'schoolClass', 'section', 'academicYear']);
        
        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        // Apply filters
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->input('class_id'));
        }
        if ($request->filled('section_id')) {
            $query->where('section_id', $request->input('section_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('admission_no', 'like', "%{$search}%");
        }

        $students = $query->orderBy('admission_no')->paginate(20);

        // Get filter data
        $classQuery = SchoolClass::query();
        $sectionQuery = Section::query();
        
        if ($tenantId) {
            $classQuery->forTenant($tenantId);
            $sectionQuery->forTenant($tenantId);
        }

        $classes = $classQuery->active()->ordered()->get();
        $sections = $sectionQuery->where('is_active', true)->get();

        return Inertia::render('students/index', [
            'students' => $students,
            'classes' => $classes,
            'sections' => $sections,
            'filters' => [
                'class_id' => $request->input('class_id'),
                'section_id' => $request->input('section_id'),
                'status' => $request->input('status'),
                'search' => $request->input('search'),
            ],
        ]);
    }

    /**
     * Display the student profile.
     */
    public function show(Student $student): Response
    {
        $this->authorizeForTenant($student);

        $student->load([
            'user',
            'schoolClass',
            'section',
            'academicYear',
            'guardians',
            'attendances' => fn($q) => $q->latest()->take(30),
            'examResults' => fn($q) => $q->latest()->take(10),
        ]);

        return Inertia::render('students/show', [
            'student' => $student,
        ]);
    }

    /**
     * Show the form for creating a new student.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $classQuery = SchoolClass::query();
        $sectionQuery = Section::query();
        $yearQuery = AcademicYear::query();

        if ($tenantId) {
            $classQuery->forTenant($tenantId);
            $sectionQuery->forTenant($tenantId);
            $yearQuery->forTenant($tenantId);
        }

        $classes = $classQuery->active()->ordered()->get();
        $sections = $sectionQuery->where('is_active', true)->get();
        $academicYears = $yearQuery->orderByDesc('start_date')->get();

        return Inertia::render('students/create', [
            'classes' => $classes,
            'sections' => $sections,
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'admission_no' => 'required|string|max:50',
            'admission_date' => 'required|date',
            'class_id' => 'required|exists:classes,id',
            'section_id' => 'required|exists:sections,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'blood_group' => 'nullable|string|max:10',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:50',
            'present_address' => 'nullable|string|max:500',
            'permanent_address' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive,graduated,transferred',
        ]);

        $user = $request->user();

        // Create user account for student
        $studentUser = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt('password'), // Default password
            'tenant_id' => $user->tenant_id,
        ]);
        $studentUser->assignRole('student');

        // Create student record - filter out empty values for nullable fields with defaults
        $studentData = [
            'tenant_id' => $user->tenant_id,
            'user_id' => $studentUser->id,
            'admission_no' => $validated['admission_no'],
            'admission_date' => $validated['admission_date'],
            'class_id' => $validated['class_id'],
            'section_id' => $validated['section_id'],
            'academic_year_id' => $validated['academic_year_id'],
            'status' => $validated['status'],
        ];

        // Only add optional fields if they have values
        if (!empty($validated['date_of_birth'])) {
            $studentData['date_of_birth'] = $validated['date_of_birth'];
        }
        if (!empty($validated['gender'])) {
            $studentData['gender'] = $validated['gender'];
        }
        if (!empty($validated['blood_group'])) {
            $studentData['blood_group'] = $validated['blood_group'];
        }
        if (!empty($validated['religion'])) {
            $studentData['religion'] = $validated['religion'];
        }
        if (!empty($validated['nationality'])) {
            $studentData['nationality'] = $validated['nationality'];
        }
        if (!empty($validated['present_address'])) {
            $studentData['present_address'] = $validated['present_address'];
        }
        if (!empty($validated['permanent_address'])) {
            $studentData['permanent_address'] = $validated['permanent_address'];
        }

        Student::create($studentData);

        return redirect()->route('students.index')
            ->with('success', 'Student created successfully.');
    }

    /**
     * Show the form for editing a student.
     */
    public function edit(Student $student): Response
    {
        $this->authorizeForTenant($student);

        $student->load(['user', 'schoolClass', 'section', 'academicYear']);

        $user = request()->user();
        $tenantId = $user->tenant_id;

        $classQuery = SchoolClass::query();
        $sectionQuery = Section::query();
        $yearQuery = AcademicYear::query();

        if ($tenantId) {
            $classQuery->forTenant($tenantId);
            $sectionQuery->forTenant($tenantId);
            $yearQuery->forTenant($tenantId);
        }

        $classes = $classQuery->active()->ordered()->get();
        $sections = $sectionQuery->where('is_active', true)->get();
        $academicYears = $yearQuery->orderByDesc('start_date')->get();

        return Inertia::render('students/edit', [
            'student' => $student,
            'classes' => $classes,
            'sections' => $sections,
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, Student $student): RedirectResponse
    {
        $this->authorizeForTenant($student);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->user_id,
            'admission_no' => 'required|string|max:50',
            'admission_date' => 'required|date',
            'class_id' => 'required|exists:classes,id',
            'section_id' => 'required|exists:sections,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'blood_group' => 'nullable|string|max:10',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:50',
            'present_address' => 'nullable|string|max:500',
            'permanent_address' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive,graduated,transferred',
        ]);

        // Update user
        $student->user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Update student
        $student->update([
            'admission_no' => $validated['admission_no'],
            'admission_date' => $validated['admission_date'],
            'class_id' => $validated['class_id'],
            'section_id' => $validated['section_id'],
            'academic_year_id' => $validated['academic_year_id'],
            'date_of_birth' => $validated['date_of_birth'],
            'gender' => $validated['gender'],
            'blood_group' => $validated['blood_group'],
            'religion' => $validated['religion'],
            'nationality' => $validated['nationality'],
            'present_address' => $validated['present_address'],
            'permanent_address' => $validated['permanent_address'],
            'status' => $validated['status'],
        ]);

        return redirect()->route('students.show', $student)
            ->with('success', 'Student updated successfully.');
    }

    /**
     * Remove the specified student.
     */
    public function destroy(Student $student): RedirectResponse
    {
        $this->authorizeForTenant($student);

        $student->delete();

        return redirect()->route('students.index')
            ->with('success', 'Student deleted successfully.');
    }

    /**
     * Ensure the student belongs to the user's tenant.
     */
    private function authorizeForTenant(Student $student): void
    {
        $user = request()->user();

        // Super-admin can access all
        if ($user->tenant_id === null) {
            return;
        }

        if ($student->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access to this student.');
        }
    }
}
