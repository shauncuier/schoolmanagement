<?php

namespace App\Http\Controllers;

use App\Models\FeePayment;
use App\Models\FeeRefund;
use App\Services\FeeRefundService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeRefundController extends Controller
{
    public function __construct(private readonly FeeRefundService $refunds) {}

    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        return Inertia::render('fees/refunds/index', [
            'refunds' => FeeRefund::forTenant($tenantId)
                ->with(['payment:id,receipt_number,amount', 'processor:id,name'])
                ->orderByDesc('id')
                ->limit(100)
                ->get()
                ->map(fn (FeeRefund $r) => [
                    'id' => $r->id,
                    'receipt' => $r->payment?->receipt_number,
                    'amount' => $r->refund_amount,
                    'reason' => $r->reason,
                    'status' => $r->status,
                    'processed_by' => $r->processor?->name,
                    'processed_at' => $r->processed_at?->toDateTimeString(),
                ]),
        ]);
    }

    public function store(Request $request, FeePayment $payment): RedirectResponse
    {
        $this->authorizeTenant($request, $payment->tenant_id);

        $validated = $request->validate([
            'refund_amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:500',
        ]);

        if ($payment->status === 'refunded') {
            return back()->withErrors(['refund_amount' => 'This payment is already fully refunded.']);
        }

        try {
            $this->refunds->process($payment, (float) $validated['refund_amount'], $validated['reason'], $request->user()->id);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['refund_amount' => $e->getMessage()]);
        }

        return back()->with('success', 'Refund processed.');
    }

    private function authorizeTenant(Request $request, string $tenantId): void
    {
        $user = $request->user();

        if ($user->tenant_id !== null && $tenantId !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
