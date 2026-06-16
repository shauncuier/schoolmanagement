<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use App\Models\FeeCategory;
use App\Models\StudentFeeAllocation;
use App\Services\FeeDiscountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends Controller
{
    public function __construct(private readonly FeeDiscountService $discounts) {}

    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        return Inertia::render('fees/discounts/index', [
            'discounts' => Discount::forTenant($tenantId)
                ->with('feeCategory:id,name')
                ->orderByDesc('id')
                ->get()
                ->map(fn (Discount $d) => [
                    'id' => $d->id,
                    'name' => $d->name,
                    'type' => $d->type,
                    'value' => $d->value,
                    'display_value' => $d->display_value,
                    'category' => $d->feeCategory?->name,
                    'is_active' => $d->is_active,
                ]),
            'categories' => FeeCategory::where('tenant_id', $tenantId)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'fee_category_id' => ['nullable', Rule::exists('fee_categories', 'id')->where('tenant_id', $tenantId)],
        ]);

        if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
            return back()->withErrors(['value' => 'A percentage discount cannot exceed 100.']);
        }

        Discount::create(array_merge($validated, ['tenant_id' => $tenantId, 'is_active' => true]));

        return back()->with('success', 'Discount created.');
    }

    public function destroy(Request $request, Discount $discount): RedirectResponse
    {
        $this->authorizeTenant($request, $discount->tenant_id);

        $discount->delete();

        return back()->with('success', 'Discount deleted.');
    }

    public function applyToAllocation(Request $request, StudentFeeAllocation $allocation): RedirectResponse
    {
        $this->authorizeTenant($request, $allocation->tenant_id);

        $validated = $request->validate([
            'discount_id' => ['required', Rule::exists('discounts', 'id')->where('tenant_id', $allocation->tenant_id)],
        ]);

        $discount = Discount::where('tenant_id', $allocation->tenant_id)->findOrFail($validated['discount_id']);
        $this->discounts->apply($allocation, $discount);

        return back()->with('success', 'Discount applied.');
    }

    public function removeFromAllocation(Request $request, StudentFeeAllocation $allocation): RedirectResponse
    {
        $this->authorizeTenant($request, $allocation->tenant_id);

        $this->discounts->remove($allocation);

        return back()->with('success', 'Discount removed.');
    }

    private function authorizeTenant(Request $request, string $tenantId): void
    {
        $user = $request->user();

        if ($user->tenant_id !== null && $tenantId !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
