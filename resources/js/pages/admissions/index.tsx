import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    FileText,
    Eye,
    Search,
    UserPlus,
    Calendar,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle,
    UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
    { title: 'Admissions', href: '/admissions' },
];

interface AdmissionApplication {
    id: number;
    application_no: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    status: 'pending' | 'under_review' | 'interview_scheduled' | 'approved' | 'rejected';
    guardian_name: string;
    guardian_phone: string;
    class_id: number;
    academic_year_id: number;
    school_class?: { name: string };
    academic_year?: { name: string };
    created_at: string;
}

interface Props {
    applications: PaginatedResponse<AdmissionApplication>;
    filters: {
        search?: string;
        status?: string;
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    under_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    interview_scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusIcons: Record<string, React.ElementType> = {
    pending: Clock,
    under_review: Search,
    interview_scheduled: Calendar,
    approved: CheckCircle2,
    rejected: XCircle,
};

export default function AdmissionsIndex({ applications, filters }: Props) {
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) => {
        const params = new URLSearchParams();
        const newFilters = { ...filters, [key]: value };

        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== 'all') params.set(k, v);
        });

        router.get(`/admissions?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', searchValue);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admission Applications" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Admission Applications
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Monitor and process prospective student applications
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admissions/apply">
                                <UserPlus className="h-4 w-4" />
                                Public Form
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, application #, or phone..."
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
                                    <SelectTrigger className="w-[160px]">
                                        <Filter className="mr-2 h-3.5 w-3.5" />
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="under_review">Under Review</SelectItem>
                                        <SelectItem value="interview_scheduled">Interview</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Application #</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Applying For</TableHead>
                                    <TableHead>Guardian</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.data.length > 0 ? (
                                    applications.data.map((app) => {
                                        const StatusIcon = statusIcons[app.status] || Clock;
                                        return (
                                            <TableRow key={app.id}>
                                                <TableCell className="font-mono text-sm font-medium">
                                                    {app.application_no}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                                            <FileText className="h-4 w-4 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {app.first_name} {app.last_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 uppercase">
                                                                {app.gender}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                                            {app.school_class?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {app.academic_year?.name}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                                            {app.guardian_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {app.guardian_phone}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`flex w-fit items-center gap-1 ${statusColors[app.status]}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {app.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {new Date(app.created_at).toLocaleDateString()}
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
                                                                <Link href={`/admissions/${app.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {app.status !== 'approved' && (
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admissions/${app.id}`}>
                                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                                        Process
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                            No applications found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {applications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: applications.last_page }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={applications.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={`/admissions?page=${i + 1}`}>{i + 1}</Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
