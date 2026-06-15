<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\PaymentIntent;
use App\Models\StudentFeeAllocation;
use App\Services\Payment\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    /**
     * Online payment screen for a single fee allocation.
     */
    public function show(Request $request, StudentFeeAllocation $allocation): Response
    {
        $this->authorizePay($request, $allocation);

        $allocation->load(['student.user:id,name', 'feeStructure.feeCategory:id,name']);

        return Inertia::render('fees/pay', [
            'allocation' => [
                'id' => $allocation->id,
                'student' => $allocation->student?->user?->name,
                'category' => $allocation->feeStructure?->feeCategory?->name,
                'net_amount' => $allocation->net_amount,
                'paid_amount' => $allocation->paid_amount,
                'due_amount' => $allocation->due_amount,
                'status' => $allocation->status,
            ],
            'gateways' => array_keys(config('payment.drivers')),
            'currency' => config('payment.currency'),
        ]);
    }

    /**
     * Create an intent and send the payer to the gateway.
     */
    public function initiate(Request $request, StudentFeeAllocation $allocation): HttpResponse
    {
        $this->authorizePay($request, $allocation);

        $validated = $request->validate(['gateway' => 'required|string']);

        if (! $this->payments->isSupported($validated['gateway'])) {
            return back()->withErrors(['gateway' => 'Unsupported payment method.']);
        }

        if ((float) $allocation->due_amount <= 0) {
            return back()->withErrors(['gateway' => 'This fee is already paid.']);
        }

        $intent = $this->payments->createIntent($allocation, $validated['gateway']);

        return Inertia::location($this->payments->checkoutUrl($intent));
    }

    /**
     * Public gateway callback / IPN. Idempotent; no auth.
     */
    public function callback(Request $request, string $gateway): RedirectResponse
    {
        $intent = $this->payments->handleCallback($gateway, $request->all());

        return redirect()->route('fees.pay.status', [
            'reference' => $intent?->reference ?? $request->input('reference'),
        ]);
    }

    /**
     * Payment result screen.
     */
    public function status(Request $request): Response
    {
        $user = $request->user();

        $intent = PaymentIntent::where('reference', $request->query('reference'))
            ->when($user->tenant_id, fn ($q) => $q->where('tenant_id', $user->tenant_id))
            ->with('feePayment:id,receipt_number,amount')
            ->first();

        return Inertia::render('fees/payment-status', [
            'intent' => $intent ? [
                'reference' => $intent->reference,
                'status' => $intent->status,
                'amount' => $intent->amount,
                'gateway' => $intent->gateway,
                'receipt' => $intent->feePayment?->receipt_number,
            ] : null,
        ]);
    }

    /**
     * A payer may settle their own fees; staff with collect-fees may settle any.
     */
    private function authorizePay(Request $request, StudentFeeAllocation $allocation): void
    {
        $user = $request->user();

        if ($user->tenant_id !== null && $allocation->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }

        if ($user->can('collect-fees')) {
            return;
        }

        if ($allocation->student_id === $user->student?->id) {
            return;
        }

        abort(403, 'You can only pay your own fees.');
    }
}
