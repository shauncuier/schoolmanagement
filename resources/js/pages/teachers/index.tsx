import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Eye, MoreHorizontal, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Teachers', href: '/teachers' },
];

interface User {
    id: number;
    name: string;
    email: string;
}

interface Teacher {
    id: number;
    employee_id: string | null;
    designation: string | null;
    department: string | null;
    joining_date: string | null;
    employment_type: string;
    is_active: boolean;
    user: User;
}

interface PaginatedData {
    data: Teacher[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    teachers: PaginatedData;
    filters: {
        status?: string;
        employment_type?: string;
        department?: string;
        search?: string;
    };
}

const employmentTypeColors: Record<string, string> = {
    'full-time': 'bg-emerald-100 text-emerald-700',
    'part-time': 'bg-blue-100 text-blue-700',
    'contract': 'bg-amber-100 text-amber-700',
    'substitute': 'bg-purple-100 text-purple-700',
};

export default function TeachersIndex({ teachers, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search });
    };

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const params = new URLSearchParams();
        const merged = { ...filters, ...newFilters };
        if (merged.search) params.set('search', merged.search);
        if (merged.status && merged.status !== 'all') params.set('status', merged.status);
        if (merged.employment_type && merged.employment_type !== 'all') params.set('employment_type', merged.employment_type);
        if (merged.department && merged.department !== 'all') params.set('department', merged.department);
        router.get(`/teachers?${params.toString()}`);
    };

    const handleDelete = (teacherId: number) => {
        if (confirm('Are you sure you want to delete this teacher?')) {
            router.delete(`/teachers/${teacherId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teachers" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Teachers
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage teaching staff
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/teachers/create">
                            <Plus className="h-4 w-4" />
                            Add Teacher
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4">
                            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, email, or employee ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Search</Button>
                            </form>
                            <Select
                                value={filters.employment_type ?? 'all'}
                                onValueChange={(v) => updateFilters({ employment_type: v })}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="full-time">Full Time</SelectItem>
                                    <SelectItem value="part-time">Part Time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="substitute">Substitute</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(v) => updateFilters({ status: v })}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Teachers Table */}
                <Card>
                    <CardContent className="p-0">
                        {(teachers.data?.length ?? 0) > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Teacher</TableHead>
                                        <TableHead>Employee ID</TableHead>
                                        <TableHead>Designation</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachers.data.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
                                                        {teacher.user?.name?.charAt(0) ?? 'T'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{teacher.user?.name}</p>
                                                        <p className="text-sm text-gray-500">{teacher.user?.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {teacher.employee_id ?? '-'}
                                            </TableCell>
                                            <TableCell>{teacher.designation ?? '-'}</TableCell>
                                            <TableCell>{teacher.department ?? '-'}</TableCell>
                                            <TableCell>
                                                <Badge className={employmentTypeColors[teacher.employment_type] ?? ''}>
                                                    {teacher.employment_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                                                    {teacher.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/teachers/${teacher.id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/teachers/${teacher.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(teacher.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Users className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No Teachers Found
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Get started by adding your first teacher.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/teachers/create">
                                        <Plus className="h-4 w-4" />
                                        Add Teacher
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {teachers.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {(teachers.current_page - 1) * teachers.per_page + 1} to{' '}
                            {Math.min(teachers.current_page * teachers.per_page, teachers.total)} of {teachers.total}
                        </p>
                        <div className="flex gap-2">
                            {teachers.current_page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/teachers?page=${teachers.current_page - 1}`}>Previous</Link>
                                </Button>
                            )}
                            {teachers.current_page < teachers.last_page && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/teachers?page=${teachers.current_page + 1}`}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
