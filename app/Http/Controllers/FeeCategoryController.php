<?php

namespace App\Http\Controllers;

use App\Models\FeeCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $query = FeeCategory::query();
        
        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        if ($request->filled('status')) {
            if ($request->input('status') === 'active') {
                $query->active();
            } else {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $categories = $query->orderBy('name')->paginate(20);

        return Inertia::render('fees/categories/index', [
            'categories' => $categories,
            'filters' => [
                'status' => $request->input('status'),
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('fees/categories/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'frequency' => 'required|in:one_time,monthly,quarterly,half_yearly,yearly',
            'is_mandatory' => 'boolean',
        ]);

        $user = $request->user();

        FeeCategory::create([
            'tenant_id' => $user->tenant_id,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'description' => $validated['description'] ?? null,
            'frequency' => $validated['frequency'],
            'is_mandatory' => $validated['is_mandatory'] ?? true,
            'is_active' => true,
        ]);

        return redirect()->route('fees.categories.index')
            ->with('success', 'Fee category created successfully.');
    }

    public function edit(FeeCategory $category): Response
    {
        $this->authorizeForTenant($category);

        return Inertia::render('fees/categories/edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, FeeCategory $category): RedirectResponse
    {
        $this->authorizeForTenant($category);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'frequency' => 'required|in:one_time,monthly,quarterly,half_yearly,yearly',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return redirect()->route('fees.categories.index')
            ->with('success', 'Fee category updated successfully.');
    }

    public function destroy(FeeCategory $category): RedirectResponse
    {
        $this->authorizeForTenant($category);

        if ($category->feeStructures()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete category with associated fee structures.');
        }

        $category->delete();

        return redirect()->route('fees.categories.index')
            ->with('success', 'Fee category deleted successfully.');
    }

    private function authorizeForTenant(FeeCategory $category): void
    {
        $user = request()->user();
        if ($user->tenant_id === null) return;
        if ($category->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
