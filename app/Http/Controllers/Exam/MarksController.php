<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\ExamResult;
use App\Models\ExamSchedule;
use App\Models\Student;
use App\Services\Exam\ExamGradingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MarksController extends Controller
{
    public function __construct(private readonly ExamGradingService $grading) {}

    public function edit(Request $request, ExamSchedule $schedule): Response
    {
        $this->authorizeSchedule($request, $schedule);

        $schedule->load(['subject:id,name', 'schoolClass:id,name', 'section:id,name', 'exam:id,name']);

        $students = Student::where('tenant_id', $schedule->tenant_id)
            ->where('class_id', $schedule->class_id)
            ->when($schedule->section_id, fn ($q) => $q->where('section_id', $schedule->section_id))
            ->where('status', 'active')
            ->with('user:id,name')
            ->orderBy('roll_number')
            ->get();

        $existing = ExamResult::where('exam_schedule_id', $schedule->id)->get()->keyBy('student_id');

        return Inertia::render('exams/marks', [
            'schedule' => [
                'id' => $schedule->id,
                'exam' => $schedule->exam?->name,
                'subject' => $schedule->subject?->name,
                'class' => $schedule->schoolClass?->name,
                'section' => $schedule->section?->name,
                'full_marks' => $schedule->full_marks,
                'pass_marks' => $schedule->pass_marks,
            ],
            'students' => $students->map(fn (Student $s) => [
                'id' => $s->id,
                'name' => $s->user?->name ?? $s->admission_no,
                'roll' => $s->roll_number,
                'marks_obtained' => $existing[$s->id]->marks_obtained ?? null,
                'is_absent' => (bool) ($existing[$s->id]->is_absent ?? false),
            ]),
        ]);
    }

    public function update(Request $request, ExamSchedule $schedule): RedirectResponse
    {
        $this->authorizeSchedule($request, $schedule);

        $validated = $request->validate([
            'marks' => 'required|array',
            'marks.*.student_id' => ['required', Rule::exists('students', 'id')->where('tenant_id', $schedule->tenant_id)],
            'marks.*.marks_obtained' => 'nullable|numeric|min:0|max:'.$schedule->full_marks,
            'marks.*.is_absent' => 'boolean',
        ]);

        $written = $this->grading->enterMarks($schedule, $validated['marks'], $request->user()->id);

        return back()->with('success', "Saved marks for {$written} student(s).");
    }

    private function authorizeSchedule(Request $request, ExamSchedule $schedule): void
    {
        $user = $request->user();
        if ($user->tenant_id !== null && $schedule->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
