import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Bell,
    Globe,
    Key,
    Mail,
    RefreshCw,
    Save,
    Server,
    Settings,
    Shield,
    ToggleLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin/settings' },
    { title: 'System Settings', href: '/admin/settings' },
];

interface GeneralSettings {
    platform_name: string;
    platform_description: string;
    support_email: string;
    support_phone: string;
    default_timezone: string;
    default_language: string;
    date_format: string;
    time_format: string;
}

interface EmailSettings {
    mail_driver: string;
    mail_host: string;
    mail_port: number;
    mail_username: string;
    mail_password: string;
    mail_encryption: string;
    mail_from_address: string;
    mail_from_name: string;
}

interface FeatureSettings {
    enable_registration: boolean;
    enable_social_login: boolean;
    enable_two_factor: boolean;
    enable_api_access: boolean;
    enable_notifications: boolean;
    enable_sms: boolean;
    maintenance_mode: boolean;
}

interface SecuritySettings {
    session_lifetime: number;
    password_min_length: number;
    password_require_uppercase: boolean;
    password_require_numbers: boolean;
    password_require_symbols: boolean;
    max_login_attempts: number;
    lockout_duration: number;
}

interface SystemInfo {
    php_version: string;
    laravel_version: string;
    server_os: string;
    memory_limit: string;
    max_execution_time: string;
    upload_max_filesize: string;
    timezone: string;
    environment: string;
    debug_mode: boolean;
}

interface Settings {
    general: GeneralSettings;
    email: EmailSettings;
    features: FeatureSettings;
    security: SecuritySettings;
}

interface Props {
    settings: Settings;
    systemInfo: SystemInfo;
}

export default function SettingsIndex({ settings, systemInfo }: Props) {
    const [isClearingCache, setIsClearingCache] = useState(false);

    // General form
    const generalForm = useForm<GeneralSettings>(settings.general);

    // Email form
    const emailForm = useForm<EmailSettings>(settings.email);

    // Features form
    const [features, setFeatures] = useState<FeatureSettings>(settings.features);
    const [isSavingFeatures, setIsSavingFeatures] = useState(false);

    // Security form
    const securityForm = useForm<SecuritySettings>(settings.security);

    const handleGeneralSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        generalForm.put('/admin/settings/general');
    };

    const handleEmailSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        emailForm.put('/admin/settings/email');
    };

    const handleFeaturesSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setIsSavingFeatures(true);
        router.put('/admin/settings/features', features, {
            onFinish: () => setIsSavingFeatures(false),
        });
    };

    const handleSecuritySubmit: FormEventHandler = (e) => {
        e.preventDefault();
        securityForm.put('/admin/settings/security');
    };

    const handleClearCache = () => {
        setIsClearingCache(true);
        router.post('/admin/settings/clear-cache', {}, {
            onFinish: () => setIsClearingCache(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            System Settings
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Configure platform-wide settings
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleClearCache} disabled={isClearingCache}>
                        <RefreshCw className={`h-4 w-4 ${isClearingCache ? 'animate-spin' : ''}`} />
                        {isClearingCache ? 'Clearing...' : 'Clear Cache'}
                    </Button>
                </div>

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
                        <TabsTrigger value="general" className="gap-2">
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline">General</span>
                        </TabsTrigger>
                        <TabsTrigger value="email" className="gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="hidden sm:inline">Email</span>
                        </TabsTrigger>
                        <TabsTrigger value="features" className="gap-2">
                            <ToggleLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Features</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                        <TabsTrigger value="system" className="gap-2">
                            <Server className="h-4 w-4" />
                            <span className="hidden sm:inline">System</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general">
                        <form onSubmit={handleGeneralSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-blue-500" />
                                        General Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Basic platform configuration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="platform_name">Platform Name</Label>
                                            <Input
                                                id="platform_name"
                                                value={generalForm.data.platform_name}
                                                onChange={(e) => generalForm.setData('platform_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="support_email">Support Email</Label>
                                            <Input
                                                id="support_email"
                                                type="email"
                                                value={generalForm.data.support_email}
                                                onChange={(e) => generalForm.setData('support_email', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="support_phone">Support Phone</Label>
                                            <Input
                                                id="support_phone"
                                                value={generalForm.data.support_phone}
                                                onChange={(e) => generalForm.setData('support_phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="default_timezone">Default Timezone</Label>
                                            <Select
                                                value={generalForm.data.default_timezone}
                                                onValueChange={(v) => generalForm.setData('default_timezone', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                                                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                                                    <SelectItem value="UTC">UTC</SelectItem>
                                                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                                                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="default_language">Default Language</Label>
                                            <Select
                                                value={generalForm.data.default_language}
                                                onValueChange={(v) => generalForm.setData('default_language', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="bn">Bengali</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date_format">Date Format</Label>
                                            <Select
                                                value={generalForm.data.date_format}
                                                onValueChange={(v) => generalForm.setData('date_format', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Y-m-d">YYYY-MM-DD</SelectItem>
                                                    <SelectItem value="d/m/Y">DD/MM/YYYY</SelectItem>
                                                    <SelectItem value="m/d/Y">MM/DD/YYYY</SelectItem>
                                                    <SelectItem value="d M, Y">DD Mon, YYYY</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="platform_description">Platform Description</Label>
                                        <Input
                                            id="platform_description"
                                            value={generalForm.data.platform_description}
                                            onChange={(e) => generalForm.setData('platform_description', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={generalForm.processing}>
                                            <Save className="h-4 w-4" />
                                            {generalForm.processing ? 'Saving...' : 'Save General Settings'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>

                    {/* Email Settings */}
                    <TabsContent value="email">
                        <form onSubmit={handleEmailSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-green-500" />
                                        Email Configuration
                                    </CardTitle>
                                    <CardDescription>
                                        Configure email sending settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_driver">Mail Driver</Label>
                                            <Select
                                                value={emailForm.data.mail_driver}
                                                onValueChange={(v) => emailForm.setData('mail_driver', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="smtp">SMTP</SelectItem>
                                                    <SelectItem value="mailgun">Mailgun</SelectItem>
                                                    <SelectItem value="ses">Amazon SES</SelectItem>
                                                    <SelectItem value="postmark">Postmark</SelectItem>
                                                    <SelectItem value="log">Log (Testing)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_host">SMTP Host</Label>
                                            <Input
                                                id="mail_host"
                                                value={emailForm.data.mail_host}
                                                onChange={(e) => emailForm.setData('mail_host', e.target.value)}
                                                placeholder="smtp.example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_port">SMTP Port</Label>
                                            <Input
                                                id="mail_port"
                                                type="number"
                                                value={emailForm.data.mail_port}
                                                onChange={(e) => emailForm.setData('mail_port', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_encryption">Encryption</Label>
                                            <Select
                                                value={emailForm.data.mail_encryption}
                                                onValueChange={(v) => emailForm.setData('mail_encryption', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tls">TLS</SelectItem>
                                                    <SelectItem value="ssl">SSL</SelectItem>
                                                    <SelectItem value="null">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_username">Username</Label>
                                            <Input
                                                id="mail_username"
                                                value={emailForm.data.mail_username}
                                                onChange={(e) => emailForm.setData('mail_username', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_password">Password</Label>
                                            <Input
                                                id="mail_password"
                                                type="password"
                                                value={emailForm.data.mail_password}
                                                onChange={(e) => emailForm.setData('mail_password', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_from_address">From Address</Label>
                                            <Input
                                                id="mail_from_address"
                                                type="email"
                                                value={emailForm.data.mail_from_address}
                                                onChange={(e) => emailForm.setData('mail_from_address', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_from_name">From Name</Label>
                                            <Input
                                                id="mail_from_name"
                                                value={emailForm.data.mail_from_name}
                                                onChange={(e) => emailForm.setData('mail_from_name', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={emailForm.processing}>
                                            <Save className="h-4 w-4" />
                                            {emailForm.processing ? 'Saving...' : 'Save Email Settings'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>

                    {/* Feature Toggles */}
                    <TabsContent value="features">
                        <form onSubmit={handleFeaturesSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ToggleLeft className="h-5 w-5 text-purple-500" />
                                        Feature Toggles
                                    </CardTitle>
                                    <CardDescription>
                                        Enable or disable platform features
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <p className="font-medium">User Registration</p>
                                                <p className="text-sm text-gray-500">Allow new users to register</p>
                                            </div>
                                            <Switch
                                                checked={features.enable_registration}
                                                onCheckedChange={(v) => setFeatures({ ...features, enable_registration: v })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <p className="font-medium">Social Login</p>
                                                <p className="text-sm text-gray-500">Allow login with Google, Facebook, etc.</p>
                                            </div>
                                            <Switch
                                                checked={features.enable_social_login}
                                                onCheckedChange={(v) => setFeatures({ ...features, enable_social_login: v })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <p className="font-medium">Two-Factor Authentication</p>
                                                <p className="text-sm text-gray-500">Enable 2FA for users</p>
                                            </div>
                                            <Switch
                                                checked={features.enable_two_factor}
                                                onCheckedChange={(v) => setFeatures({ ...features, enable_two_factor: v })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <p className="font-medium">API Access</p>
                                                <p className="text-sm text-gray-500">Enable API tokens for integrations</p>
                                            </div>
                                            <Switch
                                                checked={features.enable_api_access}
                                                onCheckedChange={(v) => setFeatures({ ...features, enable_api_access: v })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <p className="font-medium">Email Notifications</p>
                                                <p className="text-sm text-gray-500">Send email notifications to users</p>
                                            </div>
                                            <Switch
                                                checked={features.enable_notifications}
                                                onCheckedChange={(v) => setFeatures({ ...features, enable_notifications: v })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <p className="font-medium">SMS Notifications</p>
                                                <p className="text-sm text-gray-500">Send SMS notifications to users</p>
                                            </div>
                                            <Switch
                                                checked={features.enable_sms}
                                                onCheckedChange={(v) => setFeatures({ ...features, enable_sms: v })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4">
                                            <div>
                                                <p className="font-medium text-amber-700 dark:text-amber-400">Maintenance Mode</p>
                                                <p className="text-sm text-amber-600 dark:text-amber-500">
                                                    Put the platform in maintenance mode
                                                </p>
                                            </div>
                                            <Switch
                                                checked={features.maintenance_mode}
                                                onCheckedChange={(v) => setFeatures({ ...features, maintenance_mode: v })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isSavingFeatures}>
                                            <Save className="h-4 w-4" />
                                            {isSavingFeatures ? 'Saving...' : 'Save Feature Settings'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security">
                        <form onSubmit={handleSecuritySubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-red-500" />
                                        Security Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Configure security and authentication settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="session_lifetime">Session Lifetime (minutes)</Label>
                                            <Input
                                                id="session_lifetime"
                                                type="number"
                                                value={securityForm.data.session_lifetime}
                                                onChange={(e) => securityForm.setData('session_lifetime', parseInt(e.target.value))}
                                                min={15}
                                                max={1440}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_min_length">Password Minimum Length</Label>
                                            <Input
                                                id="password_min_length"
                                                type="number"
                                                value={securityForm.data.password_min_length}
                                                onChange={(e) => securityForm.setData('password_min_length', parseInt(e.target.value))}
                                                min={6}
                                                max={32}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                                            <Input
                                                id="max_login_attempts"
                                                type="number"
                                                value={securityForm.data.max_login_attempts}
                                                onChange={(e) => securityForm.setData('max_login_attempts', parseInt(e.target.value))}
                                                min={3}
                                                max={10}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lockout_duration">Lockout Duration (minutes)</Label>
                                            <Input
                                                id="lockout_duration"
                                                type="number"
                                                value={securityForm.data.lockout_duration}
                                                onChange={(e) => securityForm.setData('lockout_duration', parseInt(e.target.value))}
                                                min={1}
                                                max={60}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Password Requirements</Label>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="flex items-center justify-between rounded-lg border p-3">
                                                <span className="text-sm">Require Uppercase</span>
                                                <Switch
                                                    checked={securityForm.data.password_require_uppercase}
                                                    onCheckedChange={(v) => securityForm.setData('password_require_uppercase', v)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border p-3">
                                                <span className="text-sm">Require Numbers</span>
                                                <Switch
                                                    checked={securityForm.data.password_require_numbers}
                                                    onCheckedChange={(v) => securityForm.setData('password_require_numbers', v)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border p-3">
                                                <span className="text-sm">Require Symbols</span>
                                                <Switch
                                                    checked={securityForm.data.password_require_symbols}
                                                    onCheckedChange={(v) => securityForm.setData('password_require_symbols', v)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={securityForm.processing}>
                                            <Save className="h-4 w-4" />
                                            {securityForm.processing ? 'Saving...' : 'Save Security Settings'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>

                    {/* System Info */}
                    <TabsContent value="system">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Server className="h-5 w-5 text-gray-500" />
                                    System Information
                                </CardTitle>
                                <CardDescription>
                                    Server and environment details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">PHP Version</p>
                                        <p className="text-lg font-medium">{systemInfo.php_version}</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Laravel Version</p>
                                        <p className="text-lg font-medium">{systemInfo.laravel_version}</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Server OS</p>
                                        <p className="text-lg font-medium">{systemInfo.server_os}</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Memory Limit</p>
                                        <p className="text-lg font-medium">{systemInfo.memory_limit}</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Max Execution Time</p>
                                        <p className="text-lg font-medium">{systemInfo.max_execution_time}s</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Upload Max Size</p>
                                        <p className="text-lg font-medium">{systemInfo.upload_max_filesize}</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Timezone</p>
                                        <p className="text-lg font-medium">{systemInfo.timezone}</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Environment</p>
                                        <Badge variant={systemInfo.environment === 'production' ? 'default' : 'secondary'}>
                                            {systemInfo.environment}
                                        </Badge>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Debug Mode</p>
                                        <Badge variant={systemInfo.debug_mode ? 'destructive' : 'default'}>
                                            {systemInfo.debug_mode ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
