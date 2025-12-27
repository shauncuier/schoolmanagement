import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Edit,
    Mail,
    MapPin,
    Phone,
    Shield,
    UserCircle,
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

interface Tenant {
    id: string;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface StudentProfile {
    id: number;
    admission_no: string;
    roll_number: string | null;
    date_of_birth: string | null;
    gender: string | null;
}

interface TeacherProfile {
    id: number;
    employee_id: string;
    qualification: string | null;
    joining_date: string | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    avatar: string | null;
    last_login_at: string | null;
    last_login_ip: string | null;
    email_verified_at: string | null;
    created_at: string;
    deleted_at: string | null;
    tenant: Tenant | null;
    roles: Role[];
    student: StudentProfile | null;
    teacher: TeacherProfile | null;
}

interface Props {
    user: User;
}

const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ShowUser({ user }: Props) {
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(user.status);
    const [isProcessing, setIsProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'All Users', href: '/admin/users' },
        { title: user.name, href: `/admin/users/${user.id}` },
    ];

    const handleStatusChange = () => {
        setIsProcessing(true);
        router.post(`/admin/users/${user.id}/toggle-status`, {
            status: newStatus,
        }, {
            onFinish: () => {
                setIsProcessing(false);
                setStatusDialogOpen(false);
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/users">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold shadow-lg">
                                {user.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.name}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge className={statusColors[user.status]}>
                                        {user.status}
                                    </Badge>
                                    {user.roles[0] && (
                                        <Badge variant="secondary">
                                            {user.roles[0].name}
                                        </Badge>
                                    )}
                                    {user.deleted_at && (
                                        <Badge variant="destructive">Deleted</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!user.deleted_at && (
                            <>
                                <Button variant="outline" onClick={() => setStatusDialogOpen(true)}>
                                    Change Status
                                </Button>
                                <Button asChild>
                                    <Link href={`/admin/users/${user.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                        Edit User
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* User Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>Account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{user.phone || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {user.tenant ? (
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Shield className="h-5 w-5 text-purple-500" />
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-500">School</p>
                                        <p className="font-medium">
                                            {user.tenant?.name || 'Platform Admin'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <UserCircle className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Role</p>
                                        <p className="font-medium">{user.roles[0]?.name || 'No Role'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Activity</CardTitle>
                            <CardDescription>Login and verification status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Registered</p>
                                        <p className="font-medium">{formatDate(user.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email Verified</p>
                                        <p className="font-medium">
                                            {user.email_verified_at ? formatDate(user.email_verified_at) : 'Not Verified'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Last Login</p>
                                        <p className="font-medium">
                                            {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Last Login IP</p>
                                        <p className="font-medium font-mono text-sm">
                                            {user.last_login_ip || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Student Profile */}
                    {user.student && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Profile</CardTitle>
                                <CardDescription>Student-specific information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Admission No</p>
                                        <p className="font-medium font-mono">{user.student.admission_no}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Roll Number</p>
                                        <p className="font-medium">{user.student.roll_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date of Birth</p>
                                        <p className="font-medium">
                                            {user.student.date_of_birth || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Gender</p>
                                        <p className="font-medium capitalize">{user.student.gender || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Teacher Profile */}
                    {user.teacher && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Teacher Profile</CardTitle>
                                <CardDescription>Teacher-specific information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Employee ID</p>
                                        <p className="font-medium font-mono">{user.teacher.employee_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Qualification</p>
                                        <p className="font-medium">{user.teacher.qualification || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Joining Date</p>
                                        <p className="font-medium">
                                            {user.teacher.joining_date || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Status Change Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Status</DialogTitle>
                        <DialogDescription>
                            Update the status for {user.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
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
