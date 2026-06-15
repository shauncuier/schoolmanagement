<?php

namespace App\Services\Exam;

use App\Models\Exam;
use App\Models\GradePoint;
use App\Models\GradingSystem;

class GradingService
{
    /**
     * Standard Bangladesh GPA-5 letter-grade scale.
     */
    private const DEFAULT_SCALE = [
        ['grade' => 'A+', 'point' => 5.00, 'min' => 80, 'max' => 100, 'remarks' => 'Outstanding'],
        ['grade' => 'A', 'point' => 4.00, 'min' => 70, 'max' => 79.99, 'remarks' => 'Excellent'],
        ['grade' => 'A-', 'point' => 3.50, 'min' => 60, 'max' => 69.99, 'remarks' => 'Very good'],
        ['grade' => 'B', 'point' => 3.00, 'min' => 50, 'max' => 59.99, 'remarks' => 'Good'],
        ['grade' => 'C', 'point' => 2.00, 'min' => 40, 'max' => 49.99, 'remarks' => 'Average'],
        ['grade' => 'D', 'point' => 1.00, 'min' => 33, 'max' => 39.99, 'remarks' => 'Pass'],
        ['grade' => 'F', 'point' => 0.00, 'min' => 0, 'max' => 32.99, 'remarks' => 'Fail'],
    ];

    /**
     * Get (creating if necessary) the tenant's default GPA-5 grading system.
     */
    public function ensureDefaultScale(string $tenantId): GradingSystem
    {
        $system = GradingSystem::forTenant($tenantId)->default()->first();
        if ($system) {
            return $system;
        }

        $system = GradingSystem::create([
            'tenant_id' => $tenantId,
            'name' => 'GPA 5.0',
            'type' => 'gpa',
            'is_default' => true,
            'is_active' => true,
        ]);

        foreach (self::DEFAULT_SCALE as $i => $row) {
            $system->gradePoints()->create([
                'grade' => $row['grade'],
                'point' => $row['point'],
                'min_percentage' => $row['min'],
                'max_percentage' => $row['max'],
                'remarks' => $row['remarks'],
                'order' => $i + 1,
            ]);
        }

        return $system;
    }

    /**
     * Resolve the grading system that applies to an exam.
     */
    public function resolveSystem(Exam $exam): GradingSystem
    {
        if ($exam->grading_system_id) {
            $system = GradingSystem::find($exam->grading_system_id);
            if ($system) {
                return $system;
            }
        }

        return $this->ensureDefaultScale($exam->tenant_id);
    }

    /**
     * Map a percentage to its grade + grade point on a grading system.
     *
     * @return array{grade: ?string, point: ?float}
     */
    public function gradeFor(GradingSystem $system, float $percentage): array
    {
        $match = GradePoint::where('grading_system_id', $system->id)
            ->where('min_percentage', '<=', $percentage)
            ->where('max_percentage', '>=', $percentage)
            ->first();

        if (! $match) {
            // Fall back to the lowest band so a result is never gradeless.
            $match = GradePoint::where('grading_system_id', $system->id)->orderByDesc('order')->first();
        }

        return [
            'grade' => $match?->grade,
            'point' => $match ? (float) $match->point : null,
        ];
    }
}
