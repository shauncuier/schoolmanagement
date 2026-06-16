<?php

namespace App\Services;

use App\Models\StudentFeeAllocation;
use Carbon\Carbon;

class LateFeeService
{
    /**
     * Apply late fees to all overdue, unpaid allocations for a tenant that have
     * not already been charged one. Returns the number charged.
     */
    public function applyOverdue(string $tenantId): int
    {
        $count = 0;

        StudentFeeAllocation::forTenant($tenantId)
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->where('late_fee', 0)
            ->where('due_amount', '>', 0)
            ->whereNotNull('due_date')
            ->with('feeStructure:id,late_fee,late_fee_grace_days')
            ->chunkById(200, function ($allocations) use (&$count) {
                foreach ($allocations as $allocation) {
                    if ($this->applyTo($allocation)) {
                        $count++;
                    }
                }
            });

        return $count;
    }

    /**
     * Charge the structure's late fee to one allocation if it is overdue and
     * has not been charged yet. Returns true when a fee was applied.
     */
    public function applyTo(StudentFeeAllocation $allocation): bool
    {
        $structure = $allocation->feeStructure;
        $lateFee = (float) ($structure->late_fee ?? 0);

        if ($lateFee <= 0 || (float) $allocation->late_fee > 0 || (float) $allocation->due_amount <= 0) {
            return false;
        }

        $grace = (int) ($structure->late_fee_grace_days ?? 0);
        $cutoff = Carbon::parse($allocation->due_date)->addDays($grace)->endOfDay();

        if (now()->lte($cutoff)) {
            return false;
        }

        $allocation->update([
            'late_fee' => $lateFee,
            'net_amount' => round((float) $allocation->net_amount + $lateFee, 2),
            'due_amount' => round((float) $allocation->due_amount + $lateFee, 2),
            'status' => 'overdue',
        ]);

        return true;
    }
}
