<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Tenant;
use App\Services\ResultService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicResultController extends Controller
{
    public function __construct(private readonly ResultService $results) {}

    /**
     * Public result-lookup landing page for a school.
     */
    public function show(Tenant $tenant): Response
    {
        return Inertia::render('public/results', $this->payload($tenant));
    }

    /**
     * Look up one student's published result. Throttled at the route level.
     */
    public function lookup(Request $request, Tenant $tenant): Response
    {
        $validated = $request->validate([
            'exam_id' => 'required|integer',
            'roll' => 'required|string|max:50',
        ]);

        $result = $this->results->lookup($tenant, (int) $validated['exam_id'], $validated['roll']);

        return Inertia::render('public/results', array_merge($this->payload($tenant), [
            'result' => $result,
            'searched' => true,
            'query' => ['exam_id' => (string) $validated['exam_id'], 'roll' => $validated['roll']],
        ]));
    }

    private function payload(Tenant $tenant): array
    {
        return [
            'school' => [
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'logo' => $tenant->logo,
            ],
            'exams' => Exam::forTenant($tenant->id)
                ->published()
                ->orderByDesc('result_published_at')
                ->get(['id', 'name'])
                ->map(fn (Exam $exam) => ['id' => $exam->id, 'name' => $exam->name]),
        ];
    }
}
