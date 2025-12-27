<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    /**
     * Display a listing of classes.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Super-admin can see all, others see only their tenant
        $query = SchoolClass::query();
        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        $classes = $query->withCount('sections')->ordered()->paginate(15);

        return Inertia::render('classes/index', [
            'classes' => $classes,
        ]);
    }

    /**
     * Show the form for creating a new class.
     */
    public function create(): Response
    {
        return Inertia::render('classes/create');
    }

    /**
     * Store a newly created class.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'numeric_name' => 'nullable|string|max:10',
            'description' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $user = $request->user();

        // Set default order if not provided
        if (!isset($validated['order'])) {
            $maxOrder = SchoolClass::forTenant($user->tenant_id)->max('order') ?? 0;
            $validated['order'] = $maxOrder + 1;
        }

        SchoolClass::create([
            'tenant_id' => $user->tenant_id,
            'name' => $validated['name'],
            'numeric_name' => $validated['numeric_name'] ?? null,
            'description' => $validated['description'] ?? null,
            'order' => $validated['order'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('classes.index')
            ->with('success', 'Class created successfully.');
    }

    /**
     * Show the form for editing a class.
     */
    public function edit(SchoolClass $class): Response
    {
        $this->authorizeForTenant($class);

        return Inertia::render('classes/edit', [
            'schoolClass' => $class,
        ]);
    }

    /**
     * Update the specified class.
     */
    public function update(Request $request, SchoolClass $class): RedirectResponse
    {
        $this->authorizeForTenant($class);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'numeric_name' => 'nullable|string|max:10',
            'description' => 'nullable|string|max:500',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $class->update($validated);

        return redirect()->route('classes.index')
            ->with('success', 'Class updated successfully.');
    }

    /**
     * Remove the specified class.
     */
    public function destroy(SchoolClass $class): RedirectResponse
    {
        $this->authorizeForTenant($class);

        // Check if class has sections
        if ($class->sections()->exists()) {
            return redirect()->route('classes.index')
                ->with('error', 'Cannot delete class with existing sections.');
        }

        $class->delete();

        return redirect()->route('classes.index')
            ->with('success', 'Class deleted successfully.');
    }

    /**
     * Ensure the class belongs to the user's tenant.
     * Super-admins (no tenant_id) can access any class.
     */
    private function authorizeForTenant(SchoolClass $class): void
    {
        $user = request()->user();
        
        // Super-admin can access all
        if ($user->tenant_id === null) {
            return;
        }
        
        if ($class->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access to this class.');
        }
    }
}
