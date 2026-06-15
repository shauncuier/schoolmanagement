<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ReportCard;
use App\Models\Student;
use App\Models\Tenant;
use App\Services\Sms\SmsService;
use Illuminate\Support\Facades\DB;

class ResultService
{
    public function __construct(private readonly SmsService $sms) {}

    /**
     * Publish an exam's results: flip the exam + its report cards to published
     * and optionally SMS each student's guardian. Returns counts.
     *
     * @return array{report_cards: int, sms: int}
     */
    public function publish(Exam $exam, bool $notify = false): array
    {
        $count = DB::transaction(function () use ($exam) {
            $exam->update([
                'is_published' => true,
                'result_published_at' => now(),
                'status' => 'completed',
            ]);

            return ReportCard::where('tenant_id', $exam->tenant_id)
                ->where('exam_id', $exam->id)
                ->update(['is_published' => true]);
        });

        $sms = $notify ? $this->notifyGuardians($exam) : 0;

        return ['report_cards' => $count, 'sms' => $sms];
    }

    /**
     * Unpublish an exam's results.
     */
    public function unpublish(Exam $exam): int
    {
        return DB::transaction(function () use ($exam) {
            $exam->update(['is_published' => false, 'result_published_at' => null]);

            return ReportCard::where('tenant_id', $exam->tenant_id)
                ->where('exam_id', $exam->id)
                ->update(['is_published' => false]);
        });
    }

    /**
     * Public lookup of a single student's published result by roll number.
     * Returns null for any miss so callers can show a generic "not found".
     */
    public function lookup(Tenant $tenant, int $examId, string $roll): ?array
    {
        $exam = Exam::forTenant($tenant->id)->published()->find($examId);
        if (! $exam) {
            return null;
        }

        $student = Student::where('tenant_id', $tenant->id)
            ->where('roll_number', trim($roll))
            ->first();
        if (! $student) {
            return null;
        }

        $card = ReportCard::forTenant($tenant->id)->published()
            ->where('exam_id', $exam->id)
            ->where('student_id', $student->id)
            ->first();
        if (! $card) {
            return null;
        }

        $subjects = ExamResult::forTenant($tenant->id)
            ->where('exam_id', $exam->id)
            ->where('student_id', $student->id)
            ->with('subject:id,name')
            ->get()
            ->map(fn (ExamResult $r) => [
                'subject' => $r->subject?->name,
                'marks' => $r->marks_obtained,
                'grade' => $r->grade,
                'grade_point' => $r->grade_point,
                'is_absent' => $r->is_absent,
            ]);

        return [
            'student' => [
                'name' => $student->user?->name ?? $student->admission_no,
                'roll' => $student->roll_number,
                'admission_no' => $student->admission_no,
            ],
            'exam' => ['name' => $exam->name],
            'summary' => [
                'gpa' => $card->gpa,
                'grade' => $card->grade,
                'percentage' => $card->percentage,
                'rank' => $card->rank,
                'total_students' => $card->total_students,
                'result' => $card->result,
            ],
            'subjects' => $subjects,
        ];
    }

    /**
     * SMS the result summary to each student's linked guardian/account.
     */
    private function notifyGuardians(Exam $exam): int
    {
        $tenant = Tenant::find($exam->tenant_id);
        if (! $tenant) {
            return 0;
        }

        $sent = 0;

        ReportCard::with('student.user')
            ->where('tenant_id', $exam->tenant_id)
            ->where('exam_id', $exam->id)
            ->where('is_published', true)
            ->chunk(100, function ($cards) use (&$sent, $tenant, $exam) {
                foreach ($cards as $card) {
                    $phone = $card->student?->user?->phone;
                    if (! $phone || ! $this->sms->isValidNumber($phone)) {
                        continue;
                    }

                    $body = "Result for {$exam->name}: GPA {$card->gpa}, {$card->result}.";
                    if ($this->sms->send($tenant, $phone, $body, $card->student)->status === 'sent') {
                        $sent++;
                    }
                }
            });

        return $sent;
    }
}
