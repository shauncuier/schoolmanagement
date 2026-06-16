<?php

namespace App\Http\Controllers;

use App\Models\Notice;
use App\Models\SchoolClass;
use App\Services\NoticeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NoticeController extends Controller
{
    public function __construct(private readonly NoticeService $notices) {}

    public function index(Request $request): Response
    {
        $tenantId = $request->user()->tenant_id;

        $notices = Notice::forTenant($tenantId)
            ->with('creator:id,name')
            ->orderByDesc('publish_date')
            ->limit(100)
            ->get()
            ->map(fn (Notice $n) => [
                'id' => $n->id,
                'title' => $n->title,
                'type' => $n->type,
                'audience' => $n->audience,
                'is_published' => $n->is_published,
                'publish_date' => $n->publish_date?->toDateString(),
                'created_by' => $n->creator?->name,
            ]);

        return Inertia::render('notices/index', ['notices' => $notices]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('notices/create', $this->formOptions($request));
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $this->validateNotice($request);

        $notice = Notice::create(array_merge($validated, [
            'tenant_id' => $user->tenant_id,
            'created_by' => $user->id,
            'is_published' => $request->boolean('is_published'),
            'send_notification' => $request->boolean('send_notification'),
        ]));

        $sent = $this->notices->broadcast($notice);

        return redirect()->route('notices.index')
            ->with('success', 'Notice created.'.($sent > 0 ? " SMS sent to {$sent}." : ''));
    }

    public function edit(Request $request, Notice $notice): Response
    {
        $this->authorizeForTenant($request, $notice);

        return Inertia::render('notices/edit', array_merge($this->formOptions($request), [
            'notice' => [
                'id' => $notice->id,
                'title' => $notice->title,
                'content' => $notice->content,
                'type' => $notice->type,
                'audience' => $notice->audience,
                'class_id' => $notice->class_id,
                'publish_date' => $notice->publish_date?->toDateString(),
                'expiry_date' => $notice->expiry_date?->toDateString(),
                'is_published' => $notice->is_published,
                'send_notification' => $notice->send_notification,
            ],
        ]));
    }

    public function update(Request $request, Notice $notice): RedirectResponse
    {
        $this->authorizeForTenant($request, $notice);

        $wasPublished = $notice->is_published;
        $validated = $this->validateNotice($request);

        $notice->update(array_merge($validated, [
            'is_published' => $request->boolean('is_published'),
            'send_notification' => $request->boolean('send_notification'),
        ]));

        // Only broadcast when the notice first transitions to published.
        $sent = (! $wasPublished && $notice->is_published) ? $this->notices->broadcast($notice) : 0;

        return redirect()->route('notices.index')
            ->with('success', 'Notice updated.'.($sent > 0 ? " SMS sent to {$sent}." : ''));
    }

    public function destroy(Request $request, Notice $notice): RedirectResponse
    {
        $this->authorizeForTenant($request, $notice);

        $notice->delete();

        return redirect()->route('notices.index')->with('success', 'Notice deleted.');
    }

    private function validateNotice(Request $request): array
    {
        $tenantId = $request->user()->tenant_id;

        return $request->validate([
            'title' => 'required|string|max:200',
            'content' => 'required|string|max:5000',
            'type' => 'required|in:notice,announcement,circular,event,holiday,urgent',
            'audience' => 'required|in:all,students,teachers,parents,staff,specific_class',
            'class_id' => ['nullable', 'required_if:audience,specific_class', Rule::exists('classes', 'id')->where('tenant_id', $tenantId)],
            'publish_date' => 'required|date',
            'expiry_date' => 'nullable|date|after_or_equal:publish_date',
        ]);
    }

    private function formOptions(Request $request): array
    {
        return [
            'classes' => SchoolClass::where('tenant_id', $request->user()->tenant_id)->get(['id', 'name']),
        ];
    }

    private function authorizeForTenant(Request $request, Notice $notice): void
    {
        $user = $request->user();

        if ($user->tenant_id !== null && $notice->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
