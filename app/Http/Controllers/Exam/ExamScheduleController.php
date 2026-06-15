<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExamScheduleController extends Controller
{
    public function store(Request $request, Exam $exam): RedirectResponse
    {
        $this->authorizeExam($request, $exam);

        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'class_id' => ['required', Rule::exists('classes', 'id')->where('tenant_id', $tenantId)],
            'section_id' => ['nullable', Rule::exists('sections', 'id')->where('tenant_id', $tenantId)],
            'subject_id' => ['required', Rule::exists('subjects', 'id')->where('tenant_id', $tenantId)],
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:50',
            'full_marks' => 'required|integer|min:1|max:1000',
            'pass_marks' => 'required|integer|min:0|lte:full_marks',
        ]);

        $exam->schedules()->create(array_merge($validated, ['tenant_id' => $tenantId]));

        return back()->with('success', 'Subject schedule added.');
    }

    public function destroy(Request $request, ExamSchedule $schedule): RedirectResponse
    {
        $this->authorizeSchedule($request, $schedule);

        $schedule->delete();

        return back()->with('success', 'Schedule removed.');
    }

    private function authorizeExam(Request $request, Exam $exam): void
    {
        $user = $request->user();
        if ($user->tenant_id !== null && $exam->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }

    private function authorizeSchedule(Request $request, ExamSchedule $schedule): void
    {
        $user = $request->user();
        if ($user->tenant_id !== null && $schedule->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
