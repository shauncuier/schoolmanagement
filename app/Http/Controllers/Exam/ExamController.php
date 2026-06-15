<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Exam;
use App\Models\ExamType;
use App\Models\GradingSystem;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Services\Exam\ExamGradingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $exams = Exam::forTenant($tenantId)
            ->withCount(['reportCards', 'schedules'])
            ->orderByDesc('start_date')
            ->get()
            ->map(fn (Exam $exam) => [
                'id' => $exam->id,
                'name' => $exam->name,
                'status' => $exam->status,
                'is_published' => $exam->is_published,
                'start_date' => $exam->start_date,
                'end_date' => $exam->end_date,
                'schedules_count' => $exam->schedules_count,
                'report_cards_count' => $exam->report_cards_count,
            ]);

        return Inertia::render('exams/index', ['exams' => $exams]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('exams/create', $this->formOptions($request));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateExam($request);

        Exam::create(array_merge($validated, [
            'tenant_id' => $request->user()->tenant_id,
            'status' => 'upcoming',
        ]));

        return redirect()->route('exams.index')->with('success', 'Exam created.');
    }

    public function show(Request $request, Exam $exam): Response
    {
        $this->authorizeForTenant($request, $exam);

        $exam->load([
            'schedules' => fn ($q) => $q->with(['subject:id,name', 'schoolClass:id,name', 'section:id,name'])
                ->withCount('results'),
        ]);

        return Inertia::render('exams/show', [
            'exam' => [
                'id' => $exam->id,
                'name' => $exam->name,
                'status' => $exam->status,
                'is_published' => $exam->is_published,
                'start_date' => $exam->start_date,
                'end_date' => $exam->end_date,
            ],
            'schedules' => $exam->schedules->map(fn ($s) => [
                'id' => $s->id,
                'subject' => $s->subject?->name,
                'class' => $s->schoolClass?->name,
                'section' => $s->section?->name,
                'date' => $s->date,
                'full_marks' => $s->full_marks,
                'pass_marks' => $s->pass_marks,
                'results_count' => $s->results_count,
            ]),
            'classes' => SchoolClass::where('tenant_id', $exam->tenant_id)->get(['id', 'name']),
            'sections' => Section::where('tenant_id', $exam->tenant_id)->get(['id', 'name', 'class_id']),
            'subjects' => Subject::where('tenant_id', $exam->tenant_id)->get(['id', 'name']),
        ]);
    }

    public function edit(Request $request, Exam $exam): Response
    {
        $this->authorizeForTenant($request, $exam);

        return Inertia::render('exams/edit', array_merge($this->formOptions($request), [
            'exam' => [
                'id' => $exam->id,
                'name' => $exam->name,
                'exam_type_id' => $exam->exam_type_id,
                'academic_year_id' => $exam->academic_year_id,
                'grading_system_id' => $exam->grading_system_id,
                'start_date' => $exam->start_date?->toDateString(),
                'end_date' => $exam->end_date?->toDateString(),
                'description' => $exam->description,
                'status' => $exam->status,
            ],
        ]));
    }

    public function update(Request $request, Exam $exam): RedirectResponse
    {
        $this->authorizeForTenant($request, $exam);

        $validated = $this->validateExam($request);
        $validated['status'] = $request->validate([
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
        ])['status'];

        $exam->update($validated);

        return redirect()->route('exams.index')->with('success', 'Exam updated.');
    }

    public function destroy(Request $request, Exam $exam): RedirectResponse
    {
        $this->authorizeForTenant($request, $exam);

        $exam->delete();

        return redirect()->route('exams.index')->with('success', 'Exam deleted.');
    }

    public function generateReportCards(Request $request, Exam $exam, ExamGradingService $grading): RedirectResponse
    {
        $this->authorizeForTenant($request, $exam);

        $count = $grading->generateReportCards($exam);

        return back()->with('success', "Generated {$count} report card(s).");
    }

    private function validateExam(Request $request): array
    {
        $tenantId = $request->user()->tenant_id;

        return $request->validate([
            'name' => 'required|string|max:150',
            'exam_type_id' => ['required', Rule::exists('exam_types', 'id')->where('tenant_id', $tenantId)],
            'academic_year_id' => ['required', Rule::exists('academic_years', 'id')->where('tenant_id', $tenantId)],
            'grading_system_id' => ['nullable', Rule::exists('grading_systems', 'id')->where('tenant_id', $tenantId)],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:1000',
        ]);
    }

    private function formOptions(Request $request): array
    {
        $tenantId = $request->user()->tenant_id;

        return [
            'examTypes' => ExamType::forTenant($tenantId)->get(['id', 'name']),
            'academicYears' => AcademicYear::where('tenant_id', $tenantId)->get(['id', 'name']),
            'gradingSystems' => GradingSystem::forTenant($tenantId)->get(['id', 'name']),
        ];
    }

    private function authorizeForTenant(Request $request, Exam $exam): void
    {
        $user = $request->user();

        if ($user->tenant_id === null) {
            return;
        }

        if ($exam->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
