import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Globe, MapPin, Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FormEventHandler } from 'react';

interface School {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string;
    postal_code: string | null;
    primary_color: string;
    secondary_color: string;
    subscription_plan: string;
    status: string;
    primary_domain: string | null;
}

interface Props {
    school: School;
}

export default function EditSchool({ school }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Schools', href: '/admin/schools' },
        { title: school.name, href: `/admin/schools/${school.id}` },
        { title: 'Edit', href: `/admin/schools/${school.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: school.name,
        slug: school.slug,
        email: school.email ?? '',
        phone: school.phone ?? '',
        website: school.website ?? '',
        address: school.address ?? '',
        city: school.city ?? '',
        state: school.state ?? '',
        country: school.country,
        postal_code: school.postal_code ?? '',
        primary_color: school.primary_color,
        secondary_color: school.secondary_color,
        subscription_plan: school.subscription_plan,
        status: school.status,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/schools/${school.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${school.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/schools">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit School
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update details for {school.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-500" />
                                    <CardTitle>Basic Information</CardTitle>
                                </div>
                                <CardDescription>
                                    School's basic details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">School Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter school name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug *</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="school-slug"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        Current domain: {school.primary_domain || `${data.slug}.schoolsync.com`}
                                    </p>
                                    {errors.slug && (
                                        <p className="text-sm text-red-500">{errors.slug}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="school@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+880 1XXX-XXXXXX"
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-500">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        placeholder="https://school.edu"
                                    />
                                    {errors.website && (
                                        <p className="text-sm text-red-500">{errors.website}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-green-500" />
                                    <CardTitle>Address</CardTitle>
                                </div>
                                <CardDescription>
                                    School location details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Street Address</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Enter street address"
                                        rows={2}
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-500">{errors.address}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="City"
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-500">{errors.city}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State/Province</Label>
                                        <Input
                                            id="state"
                                            value={data.state}
                                            onChange={(e) => setData('state', e.target.value)}
                                            placeholder="State"
                                        />
                                        {errors.state && (
                                            <p className="text-sm text-red-500">{errors.state}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                            placeholder="Country"
                                        />
                                        {errors.country && (
                                            <p className="text-sm text-red-500">{errors.country}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input
                                            id="postal_code"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            placeholder="Postal Code"
                                        />
                                        {errors.postal_code && (
                                            <p className="text-sm text-red-500">{errors.postal_code}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Branding */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-purple-500" />
                                    <CardTitle>Branding</CardTitle>
                                </div>
                                <CardDescription>
                                    Customize school appearance
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="primary_color">Primary Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="primary_color"
                                                type="color"
                                                value={data.primary_color}
                                                onChange={(e) => setData('primary_color', e.target.value)}
                                                className="h-10 w-14 p-1"
                                            />
                                            <Input
                                                value={data.primary_color}
                                                onChange={(e) => setData('primary_color', e.target.value)}
                                                placeholder="#3b82f6"
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
                                                value={data.secondary_color}
                                                onChange={(e) => setData('secondary_color', e.target.value)}
                                                className="h-10 w-14 p-1"
                                            />
                                            <Input
                                                value={data.secondary_color}
                                                onChange={(e) => setData('secondary_color', e.target.value)}
                                                placeholder="#1e40af"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="rounded-lg border p-4">
                                    <p className="mb-2 text-sm font-medium text-gray-500">Preview</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold"
                                            style={{ backgroundColor: data.primary_color }}
                                        >
                                            {data.name ? data.name.substring(0, 2).toUpperCase() : 'SC'}
                                        </div>
                                        <div>
                                            <p className="font-medium" style={{ color: data.primary_color }}>
                                                {data.name || 'School Name'}
                                            </p>
                                            <p className="text-sm" style={{ color: data.secondary_color }}>
                                                {school.primary_domain || `${data.slug}.schoolsync.com`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription & Status */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-amber-500" />
                                    <CardTitle>Subscription & Status</CardTitle>
                                </div>
                                <CardDescription>
                                    Manage subscription and status
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subscription_plan">Subscription Plan</Label>
                                    <Select
                                        value={data.subscription_plan}
                                        onValueChange={(value) => setData('subscription_plan', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="basic">Basic</SelectItem>
                                            <SelectItem value="standard">Standard</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.subscription_plan && (
                                        <p className="text-sm text-red-500">{errors.subscription_plan}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-500">{errors.status}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/schools">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
