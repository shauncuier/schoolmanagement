import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Building2, Palette, GraduationCap, Upload, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'School Settings', href: '/school-settings' },
];

interface SchoolData {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    logo: string | null;
    favicon: string | null;
    primary_color: string;
    secondary_color: string;
    theme: string;
    settings: {
        academic?: {
            default_grading_system?: string;
            attendance_threshold?: number;
            late_fee_enabled?: boolean;
            sms_notifications?: boolean;
            email_notifications?: boolean;
        };
    };
}

interface Props {
    school: SchoolData;
}

export default function SchoolSettings({ school }: Props) {
    const [activeTab, setActiveTab] = useState('general');

    const generalForm = useForm({
        name: school.name,
        email: school.email,
        phone: school.phone || '',
        website: school.website || '',
        address: school.address || '',
        city: school.city || '',
        state: school.state || '',
        country: school.country || '',
        postal_code: school.postal_code || '',
    });

    const brandingForm = useForm({
        primary_color: school.primary_color,
        secondary_color: school.secondary_color,
        theme: school.theme,
    });

    const academicForm = useForm({
        default_grading_system: school.settings?.academic?.default_grading_system || 'gpa',
        attendance_threshold: school.settings?.academic?.attendance_threshold || 75,
        late_fee_enabled: school.settings?.academic?.late_fee_enabled || false,
        sms_notifications: school.settings?.academic?.sms_notifications || false,
        email_notifications: school.settings?.academic?.email_notifications ?? true,
    });

    const logoForm = useForm<{ logo: File | null }>({
        logo: null,
    });

    const submitGeneral: FormEventHandler = (e) => {
        e.preventDefault();
        generalForm.put('/school-settings/general');
    };

    const submitBranding: FormEventHandler = (e) => {
        e.preventDefault();
        brandingForm.put('/school-settings/branding');
    };

    const submitAcademic: FormEventHandler = (e) => {
        e.preventDefault();
        academicForm.put('/school-settings/academic');
    };

    const handleLogoUpload: FormEventHandler = (e) => {
        e.preventDefault();
        if (logoForm.data.logo) {
            logoForm.post('/school-settings/logo', {
                forceFormData: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Settings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">School Settings</h1>
                    <p className="text-muted-foreground">
                        Configure your school's information, branding, and preferences.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="branding" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Branding
                        </TabsTrigger>
                        <TabsTrigger value="academic" className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Academic
                        </TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Information</CardTitle>
                                <CardDescription>
                                    Basic information about your school.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitGeneral} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">School Name *</Label>
                                            <Input
                                                id="name"
                                                value={generalForm.data.name}
                                                onChange={(e) => generalForm.setData('name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={generalForm.data.email}
                                                onChange={(e) => generalForm.setData('email', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={generalForm.data.phone}
                                                onChange={(e) => generalForm.setData('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                type="url"
                                                value={generalForm.data.website}
                                                onChange={(e) => generalForm.setData('website', e.target.value)}
                                                placeholder="https://"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            value={generalForm.data.address}
                                            onChange={(e) => generalForm.setData('address', e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={generalForm.data.city}
                                                onChange={(e) => generalForm.setData('city', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State/Province</Label>
                                            <Input
                                                id="state"
                                                value={generalForm.data.state}
                                                onChange={(e) => generalForm.setData('state', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                value={generalForm.data.country}
                                                onChange={(e) => generalForm.setData('country', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="postal_code">Postal Code</Label>
                                            <Input
                                                id="postal_code"
                                                value={generalForm.data.postal_code}
                                                onChange={(e) => generalForm.setData('postal_code', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={generalForm.processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Branding Settings */}
                    <TabsContent value="branding">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Logo & Favicon</CardTitle>
                                    <CardDescription>
                                        Upload your school's logo and favicon.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleLogoUpload} className="space-y-4">
                                        <div className="flex items-center gap-6">
                                            <div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                                                {school.logo ? (
                                                    <img
                                                        src={`/storage/${school.logo}`}
                                                        alt="School Logo"
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <Building2 className="h-8 w-8 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="logo">Upload Logo</Label>
                                                <Input
                                                    id="logo"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/svg+xml"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) logoForm.setData('logo', file);
                                                    }}
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    Recommended: 200x200px, PNG or SVG
                                                </p>
                                            </div>
                                        </div>
                                        <Button type="submit" size="sm" disabled={logoForm.processing || !logoForm.data.logo}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Logo
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Theme & Colors</CardTitle>
                                    <CardDescription>
                                        Customize your school's color scheme.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submitBranding} className="space-y-6">
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="primary_color">Primary Color</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="primary_color"
                                                        type="color"
                                                        value={brandingForm.data.primary_color}
                                                        onChange={(e) => brandingForm.setData('primary_color', e.target.value)}
                                                        className="h-10 w-20 cursor-pointer p-1"
                                                    />
                                                    <Input
                                                        value={brandingForm.data.primary_color}
                                                        onChange={(e) => brandingForm.setData('primary_color', e.target.value)}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="secondary_color">Secondary Color</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="secondary_color"
                                                        type="color"
                                                        value={brandingForm.data.secondary_color}
                                                        onChange={(e) => brandingForm.setData('secondary_color', e.target.value)}
                                                        className="h-10 w-20 cursor-pointer p-1"
                                                    />
                                                    <Input
                                                        value={brandingForm.data.secondary_color}
                                                        onChange={(e) => brandingForm.setData('secondary_color', e.target.value)}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="theme">Theme</Label>
                                                <Select
                                                    value={brandingForm.data.theme}
                                                    onValueChange={(value) => brandingForm.setData('theme', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="light">Light</SelectItem>
                                                        <SelectItem value="dark">Dark</SelectItem>
                                                        <SelectItem value="system">System</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={brandingForm.processing}>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Academic Settings */}
                    <TabsContent value="academic">
                        <Card>
                            <CardHeader>
                                <CardTitle>Academic Preferences</CardTitle>
                                <CardDescription>
                                    Configure academic and notification settings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitAcademic} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="grading_system">Default Grading System</Label>
                                            <Select
                                                value={academicForm.data.default_grading_system}
                                                onValueChange={(value) => academicForm.setData('default_grading_system', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="gpa">GPA (4.0 Scale)</SelectItem>
                                                    <SelectItem value="cgpa">CGPA (10.0 Scale)</SelectItem>
                                                    <SelectItem value="percentage">Percentage</SelectItem>
                                                    <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="attendance_threshold">Attendance Threshold (%)</Label>
                                            <Input
                                                id="attendance_threshold"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={academicForm.data.attendance_threshold}
                                                onChange={(e) => academicForm.setData('attendance_threshold', parseInt(e.target.value))}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Minimum attendance required for exams
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-medium">Features</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div>
                                                    <Label>Late Fee Calculation</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Automatically calculate late fees for overdue payments
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={academicForm.data.late_fee_enabled}
                                                    onCheckedChange={(checked) => academicForm.setData('late_fee_enabled', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div>
                                                    <Label>SMS Notifications</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Send SMS alerts to parents and students
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={academicForm.data.sms_notifications}
                                                    onCheckedChange={(checked) => academicForm.setData('sms_notifications', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div>
                                                    <Label>Email Notifications</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Send email notifications for important updates
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={academicForm.data.email_notifications}
                                                    onCheckedChange={(checked) => academicForm.setData('email_notifications', checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={academicForm.processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
