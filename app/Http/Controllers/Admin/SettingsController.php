<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * The settings file path.
     */
    private string $settingsPath;

    public function __construct()
    {
        $this->settingsPath = storage_path('app/system_settings.json');
    }

    /**
     * Display the system settings page.
     */
    public function index(): Response
    {
        $this->authorizeSuperAdmin();

        $settings = $this->getSettings();

        // System information
        $systemInfo = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_os' => PHP_OS,
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'timezone' => config('app.timezone'),
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug'),
        ];

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
            'systemInfo' => $systemInfo,
        ]);
    }

    /**
     * Update general settings.
     */
    public function updateGeneral(Request $request): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'platform_name' => 'required|string|max:100',
            'platform_description' => 'nullable|string|max:500',
            'support_email' => 'required|email|max:255',
            'support_phone' => 'nullable|string|max:20',
            'default_timezone' => 'required|string|max:100',
            'default_language' => 'required|string|max:10',
            'date_format' => 'required|string|max:20',
            'time_format' => 'required|string|max:20',
        ]);

        $this->updateSettings('general', $validated);

        return redirect()->back()
            ->with('success', 'General settings updated successfully.');
    }

    /**
     * Update email settings.
     */
    public function updateEmail(Request $request): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'mail_driver' => 'required|in:smtp,mailgun,ses,postmark,log',
            'mail_host' => 'nullable|string|max:255',
            'mail_port' => 'nullable|integer|min:1|max:65535',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|in:tls,ssl,null',
            'mail_from_address' => 'required|email|max:255',
            'mail_from_name' => 'required|string|max:100',
        ]);

        $this->updateSettings('email', $validated);

        return redirect()->back()
            ->with('success', 'Email settings updated successfully.');
    }

    /**
     * Update feature toggles.
     */
    public function updateFeatures(Request $request): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'enable_registration' => 'boolean',
            'enable_social_login' => 'boolean',
            'enable_two_factor' => 'boolean',
            'enable_api_access' => 'boolean',
            'enable_notifications' => 'boolean',
            'enable_sms' => 'boolean',
            'maintenance_mode' => 'boolean',
        ]);

        $this->updateSettings('features', $validated);

        return redirect()->back()
            ->with('success', 'Feature toggles updated successfully.');
    }

    /**
     * Update security settings.
     */
    public function updateSecurity(Request $request): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'session_lifetime' => 'required|integer|min:15|max:1440',
            'password_min_length' => 'required|integer|min:6|max:32',
            'password_require_uppercase' => 'boolean',
            'password_require_numbers' => 'boolean',
            'password_require_symbols' => 'boolean',
            'max_login_attempts' => 'required|integer|min:3|max:10',
            'lockout_duration' => 'required|integer|min:1|max:60',
        ]);

        $this->updateSettings('security', $validated);

        return redirect()->back()
            ->with('success', 'Security settings updated successfully.');
    }

    /**
     * Clear system cache.
     */
    public function clearCache(): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        Cache::flush();

        return redirect()->back()
            ->with('success', 'System cache cleared successfully.');
    }

    /**
     * Get all settings from file.
     */
    private function getSettings(): array
    {
        if (File::exists($this->settingsPath)) {
            return json_decode(File::get($this->settingsPath), true) ?? [];
        }

        // Default settings
        return [
            'general' => [
                'platform_name' => 'SchoolSync',
                'platform_description' => 'Multi-tenant School Management System',
                'support_email' => 'support@schoolsync.com',
                'support_phone' => '',
                'default_timezone' => 'Asia/Dhaka',
                'default_language' => 'en',
                'date_format' => 'Y-m-d',
                'time_format' => 'H:i',
            ],
            'email' => [
                'mail_driver' => 'smtp',
                'mail_host' => 'smtp.mailtrap.io',
                'mail_port' => 587,
                'mail_username' => '',
                'mail_password' => '',
                'mail_encryption' => 'tls',
                'mail_from_address' => 'noreply@schoolsync.com',
                'mail_from_name' => 'SchoolSync',
            ],
            'features' => [
                'enable_registration' => true,
                'enable_social_login' => false,
                'enable_two_factor' => true,
                'enable_api_access' => true,
                'enable_notifications' => true,
                'enable_sms' => false,
                'maintenance_mode' => false,
            ],
            'security' => [
                'session_lifetime' => 120,
                'password_min_length' => 8,
                'password_require_uppercase' => true,
                'password_require_numbers' => true,
                'password_require_symbols' => false,
                'max_login_attempts' => 5,
                'lockout_duration' => 15,
            ],
        ];
    }

    /**
     * Update a specific settings section.
     */
    private function updateSettings(string $section, array $data): void
    {
        $settings = $this->getSettings();
        $settings[$section] = $data;

        File::put($this->settingsPath, json_encode($settings, JSON_PRETTY_PRINT));
    }

    /**
     * Authorize that the current user is a super-admin.
     */
    private function authorizeSuperAdmin(): void
    {
        $user = request()->user();

        if (! $user || $user->tenant_id !== null) {
            abort(403, 'Only super-admin can access this resource.');
        }

        if (! $user->hasRole('super-admin')) {
            abort(403, 'Only super-admin can access this resource.');
        }
    }
}
