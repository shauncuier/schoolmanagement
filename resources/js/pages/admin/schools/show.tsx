import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Building2,
    Calendar,
    Edit,
    Globe,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    UserCheck,
    Users,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

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
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    created_at: string;
    primary_domain: string | null;
    stats: {
        users_count: number;
        students_count: number;
        teachers_count: number;
        classes_count: number;
        sections_count: number;
    };
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface Props {
    school: School;
    recentUsers: RecentUser[];
}

const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    standard: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    premium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function ShowSchool({ school, recentUsers }: Props) {
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(school.status);
    const [isProcessing, setIsProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Schools', href: '/admin/schools' },
        { title: school.name, href: `/admin/schools/${school.id}` },
    ];

    const handleStatusChange = () => {
        setIsProcessing(true);
        router.post(`/admin/schools/${school.id}/toggle-status`, {
            status: newStatus,
        }, {
            onFinish: () => {
                setIsProcessing(false);
                setStatusDialogOpen(false);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={school.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/schools">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-xl text-white text-2xl font-bold shadow-lg"
                                style={{ backgroundColor: school.primary_color }}
                            >
                                {school.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {school.name}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {school.primary_domain || `${school.slug}.schoolsync.com`}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge className={statusColors[school.status]}>
                                        {school.status}
                                    </Badge>
                                    <Badge className={planColors[school.subscription_plan]}>
                                        {school.subscription_plan}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setStatusDialogOpen(true)}>
                            Change Status
                        </Button>
                        <Button asChild>
                            <Link href={`/admin/schools/${school.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                Edit School
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{school.stats.users_count}</p>
                                <p className="text-sm text-gray-500">Total Users</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <GraduationCap className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{school.stats.students_count}</p>
                                <p className="text-sm text-gray-500">Students</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                <UserCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{school.stats.teachers_count}</p>
                                <p className="text-sm text-gray-500">Teachers</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <BookOpen className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{school.stats.classes_count}</p>
                                <p className="text-sm text-gray-500">Classes</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                                <Building2 className="h-6 w-6 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{school.stats.sections_count}</p>
                                <p className="text-sm text-gray-500">Sections</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* School Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>School Information</CardTitle>
                            <CardDescription>Basic details about the school</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{school.email || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{school.phone || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Website</p>
                                        {school.website ? (
                                            <a
                                                href={school.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-blue-600 hover:underline"
                                            >
                                                {school.website}
                                            </a>
                                        ) : (
                                            <p className="font-medium">Not set</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Registered</p>
                                        <p className="font-medium">{formatDate(school.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {(school.address || school.city || school.state) && (
                                <div className="border-t pt-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium">
                                                {[school.address, school.city, school.state, school.country]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                                {school.postal_code && ` - ${school.postal_code}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Branding */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Branding</CardTitle>
                            <CardDescription>School's visual identity</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Primary Color</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-lg shadow"
                                            style={{ backgroundColor: school.primary_color }}
                                        />
                                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {school.primary_color}
                                        </code>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Secondary Color</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-lg shadow"
                                            style={{ backgroundColor: school.secondary_color }}
                                        />
                                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {school.secondary_color}
                                        </code>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Preview */}
                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-500 mb-3">Brand Preview</p>
                                <div
                                    className="rounded-lg p-6 text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${school.primary_color} 0%, ${school.secondary_color} 100%)`,
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-lg font-bold">
                                            {school.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{school.name}</p>
                                            <p className="text-sm opacity-80">
                                                {school.primary_domain || `${school.slug}.schoolsync.com`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Users</CardTitle>
                            <CardDescription>Latest users registered in this school</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentUsers.length > 0 ? (
                                <div className="space-y-4">
                                    {recentUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium">
                                                    {user.name.substring(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(user.created_at)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No users registered yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Status Change Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change School Status</DialogTitle>
                        <DialogDescription>
                            Update the status for {school.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newStatus} onValueChange={(v) => setNewStatus(v as School['status'])}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleStatusChange} disabled={isProcessing}>
                            {isProcessing ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
