<?php

namespace App\Services;

use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\StudentFeeAllocation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FeeAllocationService
{
    /**
     * Allocate fees to students based on a fee structure.
     *
     * @param  int|null  $studentId  Optional specific student to allocate to
     * @return int Number of allocations created
     */
    public function allocate(FeeStructure $structure, ?int $studentId = null): int
    {
        $query = Student::query()
            ->where('tenant_id', $structure->tenant_id)
            ->where('academic_year_id', $structure->academic_year_id)
            ->active();

        // If structure is class-specific
        if ($structure->class_id) {
            $query->where('class_id', $structure->class_id);
        }

        // If specific student is requested
        if ($studentId) {
            $query->where('id', $studentId);
        }

        $students = $query->get();
        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($students as $student) {
                // Check if already allocated
                $exists = StudentFeeAllocation::where('student_id', $student->id)
                    ->where('fee_structure_id', $structure->id)
                    ->exists();

                if (! $exists) {
                    StudentFeeAllocation::create([
                        'tenant_id' => $structure->tenant_id,
                        'student_id' => $student->id,
                        'fee_structure_id' => $structure->id,
                        'academic_year_id' => $structure->academic_year_id,
                        'original_amount' => $structure->amount,
                        'discount_amount' => 0, // Could be enhanced later with discount logic
                        'net_amount' => $structure->amount,
                        'paid_amount' => 0,
                        'due_amount' => $structure->amount,
                        // Allocations require a due date; fall back to today when
                        // the structure leaves it open so the insert never fails.
                        'due_date' => $structure->due_date ?? now()->toDateString(),
                        'status' => 'pending',
                    ]);
                    $count++;
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Fee allocation failed for structure {$structure->id}: ".$e->getMessage());
            throw $e;
        }

        return $count;
    }

    /**
     * Bulk allocate all active fee structures for a student.
     * Useful when a new student is admitted.
     */
    public function allocateAllToStudent(Student $student): int
    {
        $structures = FeeStructure::where('tenant_id', $student->tenant_id)
            ->where('academic_year_id', $student->academic_year_id)
            ->where(function ($q) use ($student) {
                $q->whereNull('class_id')
                    ->orWhere('class_id', $student->class_id);
            })
            ->active()
            ->get();

        $count = 0;
        foreach ($structures as $structure) {
            $count += $this->allocate($structure, $student->id);
        }

        return $count;
    }
}
