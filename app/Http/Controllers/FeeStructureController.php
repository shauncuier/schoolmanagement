<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeStructureController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $query = FeeStructure::query()
            ->with(['feeCategory', 'schoolClass', 'academicYear']);
        
        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        if ($request->filled('category')) {
            $query->where('fee_category_id', $request->input('category'));
        }

        if ($request->filled('class')) {
            $query->where('class_id', $request->input('class'));
        }

        if ($request->filled('academic_year')) {
            $query->where('academic_year_id', $request->input('academic_year'));
        }

        $structures = $query->orderBy('id', 'desc')->paginate(20);

        // Get filter options
        $categoriesQuery = FeeCategory::query()->active();
        $classesQuery = SchoolClass::query()->active();
        $yearsQuery = AcademicYear::query();

        if ($tenantId) {
            $categoriesQuery->forTenant($tenantId);
            $classesQuery->forTenant($tenantId);
            $yearsQuery->forTenant($tenantId);
        }

        return Inertia::render('fees/structures/index', [
            'structures' => $structures,
            'categories' => $categoriesQuery->get(),
            'classes' => $classesQuery->get(),
            'academicYears' => $yearsQuery->get(),
            'filters' => [
                'category' => $request->input('category'),
                'class' => $request->input('class'),
                'academic_year' => $request->input('academic_year'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $categoriesQuery = FeeCategory::query()->active();
        $classesQuery = SchoolClass::query()->active();
        $yearsQuery = AcademicYear::query();

        if ($tenantId) {
            $categoriesQuery->forTenant($tenantId);
            $classesQuery->forTenant($tenantId);
            $yearsQuery->forTenant($tenantId);
        }

        return Inertia::render('fees/structures/create', [
            'categories' => $categoriesQuery->get(),
            'classes' => $classesQuery->get(),
            'academicYears' => $yearsQuery->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'fee_category_id' => 'required|exists:fee_categories,id',
            'class_id' => 'nullable|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'late_fee' => 'nullable|numeric|min:0',
            'late_fee_grace_days' => 'nullable|integer|min:0',
        ]);

        $user = $request->user();

        FeeStructure::create([
            'tenant_id' => $user->tenant_id,
            'fee_category_id' => $validated['fee_category_id'],
            'class_id' => $validated['class_id'] ?? null,
            'academic_year_id' => $validated['academic_year_id'],
            'amount' => $validated['amount'],
            'due_date' => $validated['due_date'] ?? null,
            'late_fee' => $validated['late_fee'] ?? 0,
            'late_fee_grace_days' => $validated['late_fee_grace_days'] ?? 0,
            'is_active' => true,
        ]);

        return redirect()->route('fees.structures.index')
            ->with('success', 'Fee structure created successfully.');
    }

    public function edit(FeeStructure $structure): Response
    {
        $this->authorizeForTenant($structure);

        $user = request()->user();
        $tenantId = $user->tenant_id;

        $categoriesQuery = FeeCategory::query()->active();
        $classesQuery = SchoolClass::query()->active();
        $yearsQuery = AcademicYear::query();

        if ($tenantId) {
            $categoriesQuery->forTenant($tenantId);
            $classesQuery->forTenant($tenantId);
            $yearsQuery->forTenant($tenantId);
        }

        return Inertia::render('fees/structures/edit', [
            'structure' => $structure->load(['feeCategory', 'schoolClass', 'academicYear']),
            'categories' => $categoriesQuery->get(),
            'classes' => $classesQuery->get(),
            'academicYears' => $yearsQuery->get(),
        ]);
    }

    public function update(Request $request, FeeStructure $structure): RedirectResponse
    {
        $this->authorizeForTenant($structure);

        $validated = $request->validate([
            'fee_category_id' => 'required|exists:fee_categories,id',
            'class_id' => 'nullable|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'late_fee' => 'nullable|numeric|min:0',
            'late_fee_grace_days' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $structure->update($validated);

        return redirect()->route('fees.structures.index')
            ->with('success', 'Fee structure updated successfully.');
    }

    public function destroy(FeeStructure $structure): RedirectResponse
    {
        $this->authorizeForTenant($structure);

        if ($structure->allocations()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete structure with student allocations.');
        }

        $structure->delete();

        return redirect()->route('fees.structures.index')
            ->with('success', 'Fee structure deleted successfully.');
    }

    private function authorizeForTenant(FeeStructure $structure): void
    {
        $user = request()->user();
        if ($user->tenant_id === null) return;
        if ($structure->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
