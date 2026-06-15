<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NotificationTemplateController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $tenant = $this->tenantId($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:sms,email,push,all',
            'body' => 'required|string|max:1000',
            'variables' => 'nullable|array',
            'variables.*' => 'string|max:50',
        ]);

        NotificationTemplate::create([
            'tenant_id' => $tenant,
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']).'-'.Str::lower(Str::random(6)),
            'type' => $validated['type'],
            'body' => $validated['body'],
            'variables' => $validated['variables'] ?? [],
            'is_active' => true,
        ]);

        return back()->with('success', 'Template created.');
    }

    public function update(Request $request, NotificationTemplate $template): RedirectResponse
    {
        $this->authorizeForTenant($request, $template);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'body' => 'required|string|max:1000',
            'variables' => 'nullable|array',
            'variables.*' => 'string|max:50',
            'is_active' => 'boolean',
        ]);

        $template->update([
            'name' => $validated['name'],
            'body' => $validated['body'],
            'variables' => $validated['variables'] ?? [],
            'is_active' => $request->boolean('is_active', $template->is_active),
        ]);

        return back()->with('success', 'Template updated.');
    }

    public function destroy(Request $request, NotificationTemplate $template): RedirectResponse
    {
        $this->authorizeForTenant($request, $template);

        $template->delete();

        return back()->with('success', 'Template deleted.');
    }

    private function tenantId(Request $request): string
    {
        $tenant = $request->user()?->tenant;

        if (! $tenant) {
            abort(403, 'No school context found.');
        }

        return $tenant->id;
    }

    private function authorizeForTenant(Request $request, NotificationTemplate $template): void
    {
        $user = $request->user();

        // Platform super-admin (no tenant) may manage any; system templates have a null tenant_id.
        if ($user->tenant_id === null) {
            return;
        }

        if ($template->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
