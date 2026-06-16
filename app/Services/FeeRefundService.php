<?php

namespace App\Services;

use App\Models\FeePayment;
use App\Models\FeeRefund;
use App\Models\StudentFeeAllocation;
use Illuminate\Support\Facades\DB;

class FeeRefundService
{
    /**
     * Refund (part of) a completed payment: record the refund, reduce the
     * allocation's paid amount, and recompute its due/status. Marks the payment
     * refunded once it is fully refunded.
     *
     * @throws \InvalidArgumentException when the amount is invalid
     */
    public function process(FeePayment $payment, float $amount, string $reason, ?int $by = null): FeeRefund
    {
        return DB::transaction(function () use ($payment, $amount, $reason, $by) {
            $alreadyRefunded = (float) FeeRefund::where('fee_payment_id', $payment->id)
                ->where('status', 'completed')->sum('refund_amount');

            $refundable = round((float) $payment->amount - $alreadyRefunded, 2);

            if ($amount <= 0 || $amount > $refundable) {
                throw new \InvalidArgumentException("Refund amount must be between 0 and {$refundable}.");
            }

            $refund = FeeRefund::create([
                'tenant_id' => $payment->tenant_id,
                'fee_payment_id' => $payment->id,
                'refund_amount' => $amount,
                'reason' => $reason,
                'status' => 'completed',
                'processed_by' => $by,
                'processed_at' => now(),
            ]);

            if ($payment->student_fee_allocation_id) {
                $allocation = StudentFeeAllocation::find($payment->student_fee_allocation_id);
                if ($allocation) {
                    $paid = max(0, round((float) $allocation->paid_amount - $amount, 2));
                    $due = max(0, round((float) $allocation->net_amount - $paid, 2));
                    $allocation->update([
                        'paid_amount' => $paid,
                        'due_amount' => $due,
                        'status' => $due <= 0 && $paid > 0 ? 'paid' : ($paid > 0 ? 'partial' : 'pending'),
                    ]);
                }
            }

            if (round($amount + $alreadyRefunded, 2) >= round((float) $payment->amount, 2)) {
                $payment->update(['status' => 'refunded']);
            }

            return $refund;
        });
    }
}
