<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Services\ResultService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    public function __construct(private readonly ResultService $results) {}

    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $exams = Exam::forTenant($tenantId)
            ->withCount([
                'reportCards',
                'reportCards as published_cards_count' => fn ($q) => $q->where('is_published', true),
            ])
            ->orderByDesc('start_date')
            ->get()
            ->map(fn (Exam $exam) => [
                'id' => $exam->id,
                'name' => $exam->name,
                'status' => $exam->status,
                'is_published' => $exam->is_published,
                'result_published_at' => $exam->result_published_at,
                'report_cards_count' => $exam->report_cards_count,
                'published_cards_count' => $exam->published_cards_count,
                'start_date' => $exam->start_date,
            ]);

        return Inertia::render('exams/results/index', [
            'exams' => $exams,
        ]);
    }

    public function publish(Request $request, Exam $exam): RedirectResponse
    {
        $this->authorizeForTenant($request, $exam);

        $result = $this->results->publish($exam, $request->boolean('notify'));

        $message = "Published results — {$result['report_cards']} report card(s).";
        if ($result['sms'] > 0) {
            $message .= " Sent {$result['sms']} SMS.";
        }

        return back()->with('success', $message);
    }

    public function unpublish(Request $request, Exam $exam): RedirectResponse
    {
        $this->authorizeForTenant($request, $exam);

        $this->results->unpublish($exam);

        return back()->with('success', 'Results unpublished.');
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
