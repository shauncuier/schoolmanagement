<?php

namespace App\Services;

use App\Models\Discount;
use App\Models\StudentFeeAllocation;

class FeeDiscountService
{
    /**
     * Apply a discount to an allocation and recompute net/due/status.
     */
    public function apply(StudentFeeAllocation $allocation, Discount $discount): StudentFeeAllocation
    {
        $original = (float) $allocation->original_amount;
        $discountAmount = $discount->calculateDiscount($original);
        $net = max(0, round($original - $discountAmount, 2));

        return $this->write($allocation, $discount->id, $discountAmount, $net);
    }

    /**
     * Remove any discount and restore the full amount.
     */
    public function remove(StudentFeeAllocation $allocation): StudentFeeAllocation
    {
        return $this->write($allocation, null, 0, (float) $allocation->original_amount);
    }

    private function write(StudentFeeAllocation $allocation, ?int $discountId, float $discountAmount, float $net): StudentFeeAllocation
    {
        $paid = (float) $allocation->paid_amount;
        $due = max(0, round($net - $paid, 2));

        $allocation->update([
            'discount_id' => $discountId,
            'discount_amount' => $discountAmount,
            'net_amount' => $net,
            'due_amount' => $due,
            'status' => $due <= 0 ? 'paid' : ($paid > 0 ? 'partial' : 'pending'),
        ]);

        return $allocation->refresh();
    }
}
