<?php

namespace App\Services\Payment;

use App\Models\FeePayment;
use App\Models\PaymentIntent;
use App\Models\StudentFeeAllocation;
use App\Services\Payment\Contracts\PaymentGateway;
use App\Services\Sms\SmsService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(private readonly SmsService $sms) {}

    /**
     * Resolve a gateway driver, falling back to the configured default.
     */
    public function gateway(?string $key = null): PaymentGateway
    {
        $key = $key ?: config('payment.default');
        $class = config("payment.drivers.{$key}") ?? config('payment.drivers.'.config('payment.default'));

        return app($class);
    }

    public function isSupported(string $key): bool
    {
        return array_key_exists($key, config('payment.drivers'));
    }

    /**
     * Create a pending payment intent for an allocation. Amount defaults to the
     * outstanding due and can never exceed it.
     */
    public function createIntent(StudentFeeAllocation $allocation, string $gateway, ?float $amount = null): PaymentIntent
    {
        $due = (float) $allocation->due_amount;
        $amount = $amount === null ? $due : min($amount, $due);

        if ($amount <= 0) {
            throw new \InvalidArgumentException('Nothing left to pay on this allocation.');
        }

        return PaymentIntent::create([
            'tenant_id' => $allocation->tenant_id,
            'student_fee_allocation_id' => $allocation->id,
            'student_id' => $allocation->student_id,
            'gateway' => $gateway,
            'reference' => 'PI-'.strtoupper(Str::random(16)),
            'amount' => round($amount, 2),
            'currency' => config('payment.currency'),
            'status' => 'pending',
            'expires_at' => now()->addMinutes((int) config('payment.intent_ttl_minutes')),
        ]);
    }

    /**
     * The URL to send the payer to for this intent.
     */
    public function checkoutUrl(PaymentIntent $intent): string
    {
        return $this->gateway($intent->gateway)->checkoutUrl($intent);
    }

    /**
     * Handle a gateway callback. Idempotent — a second callback for an already
     * completed intent is a no-op. Returns the resulting intent (or null if the
     * reference is unknown).
     */
    public function handleCallback(string $gateway, array $payload): ?PaymentIntent
    {
        $reference = $payload['reference'] ?? null;
        if (! $reference) {
            return null;
        }

        $intent = PaymentIntent::where('reference', $reference)->first();
        if (! $intent) {
            return null;
        }

        if ($intent->isCompleted()) {
            return $intent; // already settled — do not double-charge
        }

        if ($intent->isExpired()) {
            $intent->update(['status' => 'expired', 'payload' => $payload]);

            return $intent;
        }

        $verification = $this->gateway($gateway)->verify($intent, $payload);

        if (! $verification->success) {
            $intent->update(['status' => 'failed', 'payload' => $payload]);

            return $intent;
        }

        return $this->settle($intent, $verification);
    }

    /**
     * Record the payment and mark the allocation + intent as settled.
     */
    private function settle(PaymentIntent $intent, PaymentVerification $verification): PaymentIntent
    {
        return DB::transaction(function () use ($intent, $verification) {
            $allocation = $intent->allocation()->lockForUpdate()->first();
            $amount = (float) $intent->amount; // always the server-side amount

            $payment = FeePayment::create([
                'tenant_id' => $intent->tenant_id,
                'student_id' => $intent->student_id,
                'student_fee_allocation_id' => $allocation->id,
                'academic_year_id' => $allocation->academic_year_id,
                'receipt_number' => 'RCP-'.strtoupper(Str::random(10)),
                'amount' => $amount,
                'total_amount' => $amount,
                'payment_method' => 'mobile_banking',
                'transaction_id' => $verification->gatewayTransactionId,
                'gateway' => $intent->gateway,
                'status' => 'completed',
                'paid_at' => now(),
            ]);

            $allocation->updateAfterPayment($amount);

            $intent->update([
                'status' => 'completed',
                'gateway_transaction_id' => $verification->gatewayTransactionId,
                'fee_payment_id' => $payment->id,
                'completed_at' => now(),
                'payload' => $verification->raw,
            ]);

            $this->sendReceipt($intent, $payment);

            return $intent->refresh();
        });
    }

    private function sendReceipt(PaymentIntent $intent, FeePayment $payment): void
    {
        $student = $intent->student()->with('user')->first();
        $phone = $student?->user?->phone;
        $tenant = $student?->user?->tenant;

        if ($phone && $tenant && $this->sms->isValidNumber($phone)) {
            $this->sms->send(
                $tenant,
                $phone,
                "Payment received: BDT {$payment->amount}. Receipt {$payment->receipt_number}. Thank you.",
                $student,
            );
        }
    }
}
