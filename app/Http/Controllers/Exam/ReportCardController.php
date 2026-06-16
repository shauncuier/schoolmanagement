<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\ExamResult;
use App\Models\ReportCard;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReportCardController extends Controller
{
    /**
     * Stream a student's report card as a PDF.
     */
    public function download(Request $request, ReportCard $reportCard): Response
    {
        $this->authorizeView($request, $reportCard);

        $reportCard->load([
            'student.user:id,name',
            'student.schoolClass:id,name',
            'student.section:id,name',
            'exam:id,name',
        ]);

        $subjects = ExamResult::where('tenant_id', $reportCard->tenant_id)
            ->where('exam_id', $reportCard->exam_id)
            ->where('student_id', $reportCard->student_id)
            ->with('subject:id,name')
            ->get();

        $tenant = Tenant::find($reportCard->tenant_id);

        $pdf = Pdf::loadView('pdf.report-card', [
            'card' => $reportCard,
            'subjects' => $subjects,
            'school' => $tenant,
        ])->setPaper('a4');

        return $pdf->stream("report-card-{$reportCard->id}.pdf");
    }

    /**
     * Staff who manage results may view any card; a student/parent may view only
     * their own, and only once it is published.
     */
    private function authorizeView(Request $request, ReportCard $reportCard): void
    {
        $user = $request->user();

        if ($user->tenant_id !== null && $reportCard->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }

        if ($user->can('generate-report-cards') || $user->can('publish-results')) {
            return; // results staff — may preview unpublished cards
        }

        if (! $reportCard->is_published) {
            abort(404);
        }

        if ($reportCard->student_id === $user->student?->id) {
            return;
        }

        abort(403, 'You can only view your own report card.');
    }
}
