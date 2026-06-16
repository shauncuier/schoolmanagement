<?php

namespace App\Http\Controllers;

use App\Services\LateFeeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LateFeeController extends Controller
{
    public function __construct(private readonly LateFeeService $lateFees) {}

    /**
     * Charge late fees to all overdue, unpaid allocations for the school.
     */
    public function run(Request $request): RedirectResponse
    {
        $count = $this->lateFees->applyOverdue($request->user()->tenant_id);

        return back()->with('success', "Applied late fees to {$count} overdue allocation(s).");
    }
}
