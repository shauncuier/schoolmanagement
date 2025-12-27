<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    /**
     * Display a listing of subjects.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Super-admin can see all, others see only their tenant
        $query = Subject::query();
        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        $subjects = $query->withCount('classSubjects')->orderBy('name')->paginate(15);

        return Inertia::render('subjects/index', [
            'subjects' => $subjects,
        ]);
    }

    /**
     * Show the form for creating a new subject.
     */
    public function create(): Response
    {
        return Inertia::render('subjects/create');
    }

    /**
     * Store a newly created subject.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'type' => 'nullable|string|max:50',
            'is_optional' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $user = $request->user();

        Subject::create([
            'tenant_id' => $user->tenant_id,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'] ?? 'academic',
            'is_optional' => $validated['is_optional'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('subjects.index')
            ->with('success', 'Subject created successfully.');
    }

    /**
     * Show the form for editing a subject.
     */
    public function edit(Subject $subject): Response
    {
        $this->authorizeForTenant($subject);

        return Inertia::render('subjects/edit', [
            'subject' => $subject,
        ]);
    }

    /**
     * Update the specified subject.
     */
    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $this->authorizeForTenant($subject);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'type' => 'nullable|string|max:50',
            'is_optional' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $subject->update($validated);

        return redirect()->route('subjects.index')
            ->with('success', 'Subject updated successfully.');
    }

    /**
     * Remove the specified subject.
     */
    public function destroy(Subject $subject): RedirectResponse
    {
        $this->authorizeForTenant($subject);

        // Check if subject is used in class assignments
        if ($subject->classSubjects()->exists()) {
            return redirect()->route('subjects.index')
                ->with('error', 'Cannot delete subject assigned to classes.');
        }

        $subject->delete();

        return redirect()->route('subjects.index')
            ->with('success', 'Subject deleted successfully.');
    }

    /**
     * Ensure the subject belongs to the user's tenant.
     * Super-admins (no tenant_id) can access any subject.
     */
    private function authorizeForTenant(Subject $subject): void
    {
        $user = request()->user();
        
        // Super-admin can access all
        if ($user->tenant_id === null) {
            return;
        }
        
        if ($subject->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access to this subject.');
        }
    }
}
