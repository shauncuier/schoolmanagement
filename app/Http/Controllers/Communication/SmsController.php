<?php

namespace App\Http\Controllers\Communication;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Models\Tenant;
use App\Services\Sms\SmsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SmsController extends Controller
{
    public function __construct(private readonly SmsService $sms) {}

    /**
     * Compose screen + recent delivery logs + provider status.
     */
    public function index(Request $request): Response
    {
        $tenant = $this->tenant($request);

        $logs = NotificationLog::forTenant($tenant->id)
            ->ofType('sms')
            ->latest()
            ->limit(50)
            ->get(['id', 'recipient', 'body', 'status', 'segments', 'cost', 'provider', 'error_message', 'sent_at', 'created_at']);

        $templates = NotificationTemplate::forTenant($tenant->id)
            ->ofType('sms')
            ->active()
            ->get(['id', 'name', 'body', 'variables']);

        return Inertia::render('communication/sms/index', [
            'logs' => $logs,
            'templates' => $templates,
            'stats' => [
                'sent_this_month' => NotificationLog::forTenant($tenant->id)->ofType('sms')
                    ->where('status', 'sent')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
                'cost_this_month' => (float) NotificationLog::forTenant($tenant->id)->ofType('sms')
                    ->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('cost'),
                'failed_this_month' => NotificationLog::forTenant($tenant->id)->ofType('sms')
                    ->where('status', 'failed')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
            ],
            'settings' => [
                'provider' => $tenant->getSetting('sms.provider', config('sms.default')),
                'sender_id' => $tenant->getSetting('sms.sender_id'),
                'has_credentials' => filled($tenant->getSetting('sms.api_key')),
                'available_providers' => array_keys(config('sms.drivers')),
            ],
        ]);
    }

    /**
     * Send a message (direct body or rendered template) to many recipients.
     */
    public function send(Request $request): RedirectResponse
    {
        $tenant = $this->tenant($request);

        $validated = $request->validate([
            'recipients' => 'required|string',
            'template_id' => 'nullable|integer',
            'body' => 'required_without:template_id|nullable|string|max:1000',
            'variables' => 'nullable|array',
        ]);

        $numbers = collect(preg_split('/[\s,;]+/', $validated['recipients']))
            ->map(fn ($n) => trim($n))
            ->filter()
            ->unique()
            ->values();

        if ($numbers->isEmpty()) {
            return back()->withErrors(['recipients' => 'Add at least one recipient number.']);
        }

        $invalid = $numbers->reject(fn ($n) => $this->sms->isValidNumber($n));
        if ($invalid->isNotEmpty()) {
            return back()->withErrors([
                'recipients' => 'Invalid Bangladeshi number(s): '.$invalid->implode(', '),
            ]);
        }

        if (! empty($validated['template_id'])) {
            $template = NotificationTemplate::forTenant($tenant->id)->findOrFail($validated['template_id']);
            $body = $this->sms->render($template->body, $validated['variables'] ?? []);
        } else {
            $body = $validated['body'];
        }

        $result = $this->sms->sendBulk($tenant, $numbers->all(), $body);

        return back()->with('success', sprintf(
            'Sent %d, failed %d — %d segment(s), est. ৳%.2f.',
            $result['sent'], $result['failed'], $result['segments'], $result['cost']
        ));
    }

    /**
     * Send a single test message to verify provider configuration.
     */
    public function test(Request $request): RedirectResponse
    {
        $tenant = $this->tenant($request);

        $validated = $request->validate(['phone' => 'required|string']);

        if (! $this->sms->isValidNumber($validated['phone'])) {
            return back()->withErrors(['phone' => 'Enter a valid Bangladeshi mobile number.']);
        }

        $log = $this->sms->send(
            $tenant,
            $validated['phone'],
            "Test SMS from {$tenant->name}. Your SMS configuration works.",
            $request->user(),
        );

        return $log->status === 'sent'
            ? back()->with('success', 'Test message sent.')
            : back()->withErrors(['phone' => 'Test failed: '.($log->error_message ?? 'unknown error')]);
    }

    /**
     * Update the tenant's SMS provider configuration. Secrets are encrypted.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $tenant = $this->tenant($request);

        $validated = $request->validate([
            'provider' => 'required|string|in:'.implode(',', array_keys(config('sms.drivers'))),
            'sender_id' => 'nullable|string|max:20',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string|max:255',
        ]);

        $tenant->setSetting('sms.provider', $validated['provider']);
        $tenant->setSetting('sms.sender_id', $validated['sender_id'] ?? null);

        if (filled($validated['api_key'] ?? null)) {
            $tenant->setSetting('sms.api_key', encrypt($validated['api_key']));
        }
        if (filled($validated['api_secret'] ?? null)) {
            $tenant->setSetting('sms.api_secret', encrypt($validated['api_secret']));
        }

        return back()->with('success', 'SMS settings updated.');
    }

    /**
     * Resolve the school for the authenticated user (see tenancy-architecture-gotcha).
     */
    private function tenant(Request $request): Tenant
    {
        $tenant = $request->user()?->tenant;

        if (! $tenant) {
            abort(403, 'No school context found.');
        }

        return $tenant;
    }
}
