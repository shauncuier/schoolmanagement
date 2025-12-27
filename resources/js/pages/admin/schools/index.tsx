import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Edit,
    Eye,
    GraduationCap,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    UserCheck,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin/schools' },
    { title: 'Schools', href: '/admin/schools' },
];

interface School {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    subscription_plan: string;
    primary_color: string;
    created_at: string;
    primary_domain: string | null;
    stats: {
        users_count: number;
        students_count: number;
        teachers_count: number;
    };
}

interface Stats {
    total: number;
    active: number;
    pending: number;
    suspended: number;
}

interface Filters {
    search?: string;
    status?: string;
    plan?: string;
}

interface Props {
    schools: PaginatedResponse<School>;
    stats: Stats;
    filters: Filters;
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

export default function SchoolsIndex({ schools, stats, filters }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [newStatus, setNewStatus] = useState<string>('active');
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const handleDelete = () => {
        if (!selectedSchool) return;
        setIsProcessing(true);
        router.delete(`/admin/schools/${selectedSchool.id}`, {
            onFinish: () => {
                setIsProcessing(false);
                setDeleteDialogOpen(false);
                setSelectedSchool(null);
            },
        });
    };

    const handleStatusChange = () => {
        if (!selectedSchool) return;
        setIsProcessing(true);
        router.post(`/admin/schools/${selectedSchool.id}/toggle-status`, {
            status: newStatus,
        }, {
            onFinish: () => {
                setIsProcessing(false);
                setStatusDialogOpen(false);
                setSelectedSchool(null);
            },
        });
    };

    const applyFilter = (key: string, value: string) => {
        const params = new URLSearchParams();
        const newFilters = { ...filters, [key]: value };

        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== 'all') params.set(k, v);
        });

        router.get(`/admin/schools?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', searchValue);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schools Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Schools Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage all registered schools in the platform
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/schools/create">
                            <Plus className="h-4 w-4" />
                            Add School
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Schools
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600">
                                Active
                            </CardTitle>
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-600">
                                Pending
                            </CardTitle>
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">
                                Suspended
                            </CardTitle>
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, email, or domain..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>
                            <div className="flex gap-2">
                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(v) => applyFilter('status', v)}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.plan ?? 'all'}
                                    onValueChange={(v) => applyFilter('plan', v)}
                                >
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue placeholder="All Plans" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Plans</SelectItem>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Schools Table */}
                {(schools?.data?.length ?? 0) > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>School</TableHead>
                                        <TableHead>Domain</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schools.data.map((school) => (
                                        <TableRow key={school.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold"
                                                        style={{ backgroundColor: school.primary_color || '#3b82f6' }}
                                                    >
                                                        {school.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {school.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {school.email || school.city || school.country}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-gray-500">
                                                {school.primary_domain || school.slug}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {school.stats.users_count}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-blue-600">
                                                        <GraduationCap className="h-3.5 w-3.5" />
                                                        {school.stats.students_count}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-purple-600">
                                                        <UserCheck className="h-3.5 w-3.5" />
                                                        {school.stats.teachers_count}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={planColors[school.subscription_plan] ?? planColors.free}>
                                                    {school.subscription_plan}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[school.status] ?? ''}>
                                                    {school.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/schools/${school.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/schools/${school.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedSchool(school);
                                                                setNewStatus(school.status === 'active' ? 'suspended' : 'active');
                                                                setStatusDialogOpen(true);
                                                            }}
                                                        >
                                                            {school.status === 'active' ? 'Suspend' : 'Activate'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setSelectedSchool(school);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            disabled={school.stats.users_count > 0}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <Building2 className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No Schools Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {filters.search || filters.status || filters.plan
                                ? 'Try adjusting your search or filters.'
                                : 'Get started by adding your first school.'}
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/admin/schools/create">
                                <Plus className="h-4 w-4" />
                                Add School
                            </Link>
                        </Button>
                    </Card>
                )}

                {/* Pagination */}
                {(schools?.last_page ?? 0) > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: schools.last_page }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={schools.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={`/admin/schools?page=${i + 1}`}>{i + 1}</Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete School</DialogTitle>
                        <DialogDescription>
                            {selectedSchool?.stats.users_count && selectedSchool.stats.users_count > 0 ? (
                                <>Cannot delete "{selectedSchool?.name}" because it has {selectedSchool.stats.users_count} users.</>
                            ) : (
                                <>Are you sure you want to delete "{selectedSchool?.name}"? This action cannot be undone.</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isProcessing || (selectedSchool?.stats.users_count ?? 0) > 0}
                        >
                            {isProcessing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Change Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change School Status</DialogTitle>
                        <DialogDescription>
                            Change the status of "{selectedSchool?.name}" to {newStatus}?
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
