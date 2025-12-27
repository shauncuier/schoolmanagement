<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController extends Controller
{
    /**
     * Display a listing of academic years.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Super-admin can see all, others see only their tenant
        $query = AcademicYear::query();
        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        $academicYears = $query->orderByDesc('start_date')->paginate(10);

        return Inertia::render('academic-years/index', [
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Show the form for creating a new academic year.
     */
    public function create(): Response
    {
        return Inertia::render('academic-years/create');
    }

    /**
     * Store a newly created academic year.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,completed,upcoming',
        ]);

        $user = $request->user();

        AcademicYear::create([
            'tenant_id' => $user->tenant_id,
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => $validated['status'],
            'is_current' => false,
        ]);

        return redirect()->route('academic-years.index')
            ->with('success', 'Academic year created successfully.');
    }

    /**
     * Show the form for editing an academic year.
     */
    public function edit(AcademicYear $academicYear): Response
    {
        $this->authorizeForTenant($academicYear);

        return Inertia::render('academic-years/edit', [
            'academicYear' => $academicYear,
        ]);
    }

    /**
     * Update the specified academic year.
     */
    public function update(Request $request, AcademicYear $academicYear): RedirectResponse
    {
        $this->authorizeForTenant($academicYear);

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,completed,upcoming',
        ]);

        $academicYear->update($validated);

        return redirect()->route('academic-years.index')
            ->with('success', 'Academic year updated successfully.');
    }

    /**
     * Remove the specified academic year.
     */
    public function destroy(AcademicYear $academicYear): RedirectResponse
    {
        $this->authorizeForTenant($academicYear);

        $academicYear->delete();

        return redirect()->route('academic-years.index')
            ->with('success', 'Academic year deleted successfully.');
    }

    /**
     * Set the specified academic year as the current one.
     */
    public function setCurrent(AcademicYear $academicYear): RedirectResponse
    {
        $this->authorizeForTenant($academicYear);

        $academicYear->setAsCurrent();

        return redirect()->route('academic-years.index')
            ->with('success', 'Academic year set as current.');
    }

    /**
     * Ensure the academic year belongs to the user's tenant.
     * Super-admins (no tenant_id) can access any academic year.
     */
    private function authorizeForTenant(AcademicYear $academicYear): void
    {
        $user = request()->user();
        
        // Super-admin can access all
        if ($user->tenant_id === null) {
            return;
        }
        
        if ($academicYear->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access to this academic year.');
        }
    }
}
