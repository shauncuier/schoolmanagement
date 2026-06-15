<?php

namespace App\Services\Exam;

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ExamSchedule;
use App\Models\ReportCard;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class ExamGradingService
{
    public function __construct(private readonly GradingService $grading) {}

    /**
     * Enter (or update) subject marks for one exam schedule, computing each
     * student's grade and grade point automatically.
     *
     * @param  array<int, array{student_id: int, marks_obtained?: float|null, is_absent?: bool}>  $rows
     * @return int number of result rows written
     */
    public function enterMarks(ExamSchedule $schedule, array $rows, ?int $enteredBy = null): int
    {
        $system = $this->grading->resolveSystem($schedule->exam);
        $fullMarks = max((int) $schedule->full_marks, 1);
        $count = 0;

        DB::transaction(function () use ($schedule, $rows, $enteredBy, $system, $fullMarks, &$count) {
            foreach ($rows as $row) {
                $absent = (bool) ($row['is_absent'] ?? false);
                $marks = $absent ? null : ($row['marks_obtained'] ?? null);
                $percentage = ($absent || $marks === null) ? 0.0 : ((float) $marks / $fullMarks) * 100;
                ['grade' => $grade, 'point' => $point] = $this->grading->gradeFor($system, $percentage);

                ExamResult::updateOrCreate(
                    ['exam_schedule_id' => $schedule->id, 'student_id' => $row['student_id']],
                    [
                        'tenant_id' => $schedule->tenant_id,
                        'exam_id' => $schedule->exam_id,
                        'subject_id' => $schedule->subject_id,
                        'marks_obtained' => $marks,
                        'grade' => $grade,
                        'grade_point' => $point,
                        'is_absent' => $absent,
                        'entered_by' => $enteredBy,
                    ]
                );
                $count++;
            }
        });

        return $count;
    }

    /**
     * Build consolidated report cards for every student with results in an exam,
     * then rank them within their class+section. Returns the number of cards.
     *
     * Bangladesh rule: failing any subject (or being absent) forces GPA 0.00 / fail.
     */
    public function generateReportCards(Exam $exam): int
    {
        $system = $this->grading->resolveSystem($exam);

        $results = ExamResult::where('tenant_id', $exam->tenant_id)
            ->where('exam_id', $exam->id)
            ->with('examSchedule:id,full_marks')
            ->get()
            ->groupBy('student_id');

        $count = 0;

        DB::transaction(function () use ($exam, $system, $results, &$count) {
            foreach ($results as $studentId => $studentResults) {
                $student = Student::find($studentId);
                if (! $student || ! $student->section_id) {
                    continue;
                }

                $totalFull = 0.0;
                $obtained = 0.0;
                $points = [];
                $failed = false;

                foreach ($studentResults as $result) {
                    $totalFull += (float) ($result->examSchedule->full_marks ?? 0);
                    $obtained += (float) ($result->marks_obtained ?? 0);
                    $points[] = (float) $result->grade_point;

                    if ($result->is_absent || (float) $result->grade_point === 0.0) {
                        $failed = true;
                    }
                }

                $percentage = $totalFull > 0 ? round(($obtained / $totalFull) * 100, 2) : 0.0;
                $gpa = $failed ? 0.0 : round(array_sum($points) / max(count($points), 1), 2);
                $grade = $failed ? 'F' : $this->grading->gradeFor($system, $percentage)['grade'];

                ReportCard::updateOrCreate(
                    ['student_id' => $studentId, 'exam_id' => $exam->id],
                    [
                        'tenant_id' => $exam->tenant_id,
                        'class_id' => $student->class_id,
                        'section_id' => $student->section_id,
                        'total_marks' => $totalFull,
                        'obtained_marks' => $obtained,
                        'percentage' => $percentage,
                        'gpa' => $gpa,
                        'grade' => $grade,
                        'result' => $failed ? 'fail' : 'pass',
                    ]
                );
                $count++;
            }

            $this->assignRanks($exam);
        });

        return $count;
    }

    /**
     * Rank report cards within each class+section by GPA then percentage.
     */
    private function assignRanks(Exam $exam): void
    {
        ReportCard::where('tenant_id', $exam->tenant_id)
            ->where('exam_id', $exam->id)
            ->get()
            ->groupBy(fn (ReportCard $c) => $c->class_id.'-'.$c->section_id)
            ->each(function ($cards) {
                $ordered = $cards->sortByDesc(fn (ReportCard $c) => [(float) $c->gpa, (float) $c->percentage])->values();
                $total = $ordered->count();

                $ordered->each(function (ReportCard $card, int $i) use ($total) {
                    $card->update(['rank' => $i + 1, 'total_students' => $total]);
                });
            });
    }
}
