<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SectionController extends Controller
{
    /**
     * Display a listing of sections.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $sections = Section::forTenant($tenantId)
            ->with(['schoolClass', 'academicYear', 'classTeacher'])
            ->withCount('students')
            ->orderBy('class_id')
            ->orderBy('name')
            ->paginate(15);

        $classes = SchoolClass::forTenant($tenantId)->active()->ordered()->get();
        $academicYears = AcademicYear::forTenant($tenantId)->orderByDesc('start_date')->get();

        return Inertia::render('sections/index', [
            'sections' => $sections,
            'classes' => $classes,
            'academicYears' => $academicYears,
            'filters' => [
                'class_id' => $request->input('class_id'),
                'academic_year_id' => $request->input('academic_year_id'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new section.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $classes = SchoolClass::forTenant($tenantId)->active()->ordered()->get();
        $academicYears = AcademicYear::forTenant($tenantId)->orderByDesc('start_date')->get();
        $teachers = User::where('tenant_id', $tenantId)
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['teacher', 'class-teacher']))
            ->get(['id', 'name']);

        return Inertia::render('sections/create', [
            'classes' => $classes,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Store a newly created section.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string|max:50',
            'capacity' => 'required|integer|min:1|max:200',
            'class_teacher_id' => 'nullable|exists:users,id',
            'room_number' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $user = $request->user();

        // Verify the class belongs to same tenant
        $class = SchoolClass::findOrFail($validated['class_id']);
        if ($class->tenant_id !== $user->tenant_id) {
            abort(403, 'Invalid class selection.');
        }

        Section::create([
            'tenant_id' => $user->tenant_id,
            'class_id' => $validated['class_id'],
            'academic_year_id' => $validated['academic_year_id'],
            'name' => $validated['name'],
            'capacity' => $validated['capacity'],
            'class_teacher_id' => $validated['class_teacher_id'] ?? null,
            'room_number' => $validated['room_number'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('sections.index')
            ->with('success', 'Section created successfully.');
    }

    /**
     * Show the form for editing a section.
     */
    public function edit(Section $section): Response
    {
        $this->authorizeForTenant($section);

        $user = request()->user();
        $tenantId = $user->tenant_id;

        $classes = SchoolClass::forTenant($tenantId)->active()->ordered()->get();
        $academicYears = AcademicYear::forTenant($tenantId)->orderByDesc('start_date')->get();
        $teachers = User::where('tenant_id', $tenantId)
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['teacher', 'class-teacher']))
            ->get(['id', 'name']);

        return Inertia::render('sections/edit', [
            'section' => $section->load(['schoolClass', 'academicYear', 'classTeacher']),
            'classes' => $classes,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Update the specified section.
     */
    public function update(Request $request, Section $section): RedirectResponse
    {
        $this->authorizeForTenant($section);

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string|max:50',
            'capacity' => 'required|integer|min:1|max:200',
            'class_teacher_id' => 'nullable|exists:users,id',
            'room_number' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $section->update($validated);

        return redirect()->route('sections.index')
            ->with('success', 'Section updated successfully.');
    }

    /**
     * Remove the specified section.
     */
    public function destroy(Section $section): RedirectResponse
    {
        $this->authorizeForTenant($section);

        // Check if section has students
        if ($section->students()->exists()) {
            return redirect()->route('sections.index')
                ->with('error', 'Cannot delete section with enrolled students.');
        }

        $section->delete();

        return redirect()->route('sections.index')
            ->with('success', 'Section deleted successfully.');
    }

    /**
     * Ensure the section belongs to the user's tenant.
     */
    private function authorizeForTenant(Section $section): void
    {
        $user = request()->user();
        
        if ($section->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access to this section.');
        }
    }
}
