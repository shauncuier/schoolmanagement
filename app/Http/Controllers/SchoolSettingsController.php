<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SchoolSettingsController extends Controller
{
    /**
     * Resolve the school (tenant) for the current request.
     *
     * Tenancy in this application is keyed off the authenticated user's
     * tenant_id rather than Stancl's request-scoped tenant() helper, which is
     * never initialised on these central routes.
     */
    private function currentTenant(Request $request): Tenant
    {
        $tenant = $request->user()?->tenant;

        if (! $tenant) {
            abort(403, 'No school context found.');
        }

        return $tenant;
    }

    /**
     * Display the school settings page.
     */
    public function index(Request $request): Response
    {
        $tenant = $this->currentTenant($request);

        return Inertia::render('school-settings/index', [
            'school' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'email' => $tenant->email,
                'phone' => $tenant->phone,
                'website' => $tenant->website,
                'address' => $tenant->address,
                'city' => $tenant->city,
                'state' => $tenant->state,
                'country' => $tenant->country,
                'postal_code' => $tenant->postal_code,
                'logo' => $tenant->logo,
                'favicon' => $tenant->favicon,
                'primary_color' => $tenant->primary_color ?? '#3B82F6',
                'secondary_color' => $tenant->secondary_color ?? '#1E40AF',
                'theme' => $tenant->theme ?? 'light',
                'settings' => $tenant->settings ?? [],
            ],
        ]);
    }

    /**
     * Update general settings.
     */
    public function updateGeneral(Request $request): RedirectResponse
    {
        $tenant = $this->currentTenant($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
        ]);

        $tenant->update($validated);

        app(ActivityLogger::class)->log('settings.updated', 'Updated general school settings', $tenant, [
            'fields' => array_keys($validated),
        ]);

        return redirect()->back()
            ->with('success', 'General settings updated successfully.');
    }

    /**
     * Update branding settings.
     */
    public function updateBranding(Request $request): RedirectResponse
    {
        $tenant = $this->currentTenant($request);

        $validated = $request->validate([
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'theme' => 'nullable|in:light,dark,system',
        ]);

        $tenant->update($validated);

        return redirect()->back()
            ->with('success', 'Branding settings updated successfully.');
    }

    /**
     * Update academic settings.
     */
    public function updateAcademic(Request $request): RedirectResponse
    {
        $tenant = $this->currentTenant($request);

        $validated = $request->validate([
            'default_grading_system' => 'nullable|string|max:50',
            'attendance_threshold' => 'nullable|integer|min:0|max:100',
            'late_fee_enabled' => 'nullable|boolean',
            'sms_notifications' => 'nullable|boolean',
            'email_notifications' => 'nullable|boolean',
        ]);

        $settings = $tenant->settings ?? [];
        $settings['academic'] = $validated;
        $tenant->settings = $settings;
        $tenant->save();

        return redirect()->back()
            ->with('success', 'Academic settings updated successfully.');
    }

    /**
     * Upload school logo.
     */
    public function uploadLogo(Request $request): RedirectResponse
    {
        $tenant = $this->currentTenant($request);

        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($tenant->logo && Storage::disk('public')->exists($tenant->logo)) {
                Storage::disk('public')->delete($tenant->logo);
            }

            $path = $request->file('logo')->store('logos', 'public');
            $tenant->logo = $path;
            $tenant->save();
        }

        return redirect()->back()
            ->with('success', 'Logo uploaded successfully.');
    }

    /**
     * Upload school favicon.
     */
    public function uploadFavicon(Request $request): RedirectResponse
    {
        $tenant = $this->currentTenant($request);

        $request->validate([
            'favicon' => 'required|image|mimes:ico,png|max:512',
        ]);

        if ($request->hasFile('favicon')) {
            // Delete old favicon if exists
            if ($tenant->favicon && Storage::disk('public')->exists($tenant->favicon)) {
                Storage::disk('public')->delete($tenant->favicon);
            }

            $path = $request->file('favicon')->store('favicons', 'public');
            $tenant->favicon = $path;
            $tenant->save();
        }

        return redirect()->back()
            ->with('success', 'Favicon uploaded successfully.');
    }
}
