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
} from '@/components/ui/dropdown-menu'
import { Edit, MoreHorizontal, Plus, Search, Trash2, UserCog } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Staff', href: '/staff' },
];

interface Role {
    id: number;
    name: string;
}

interface StaffUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    roles: Role[];
}

interface PaginatedData {
    data: StaffUser[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    staff: PaginatedData;
    roles: string[];
    filters: {
        role?: string;
        search?: string;
    };
}

const roleLabels: Record<string, string> = {
    'admin': 'Admin',
    'school-owner': 'School Owner',
    'principal': 'Principal',
    'vice-principal': 'Vice Principal',
    'academic-coordinator': 'Academic Coordinator',
    'admin-officer': 'Admin Officer',
    'accountant': 'Accountant',
    'librarian': 'Librarian',
    'transport-manager': 'Transport Manager',
    'hostel-manager': 'Hostel Manager',
    'inventory-manager': 'Inventory Manager',
    'it-support': 'IT Support',
    'hr-manager': 'HR Manager',
};

export default function StaffIndex({ staff, roles = [], filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search });
    };

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const params = new URLSearchParams();
        const merged = { ...filters, ...newFilters };
        if (merged.search) params.set('search', merged.search);
        if (merged.role && merged.role !== 'all') params.set('role', merged.role);
        router.get(`/staff?${params.toString()}`);
    };

    const handleDelete = (staffId: number) => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            router.delete(`/staff/${staffId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Staff Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage administrative and support staff
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/staff/create">
                            <Plus className="h-4 w-4" />
                            Add Staff
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
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Search</Button>
                            </form>
                            <Select
                                value={filters.role ?? 'all'}
                                onValueChange={(v) => updateFilters({ role: v })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {roleLabels[role] ?? role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {(staff.data?.length ?? 0) > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Staff Member</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staff.data.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold">
                                                        {member.name?.charAt(0) ?? 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{member.name}</p>
                                                        <p className="text-sm text-gray-500">{member.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{member.phone ?? '-'}</TableCell>
                                            <TableCell>
                                                {member.roles?.map((role) => (
                                                    <Badge key={role.id} variant="outline" className="mr-1">
                                                        {roleLabels[role.name] ?? role.name}
                                                    </Badge>
                                                ))}
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
                                                            <Link href={`/staff/${member.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(member.id)}
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
                                <UserCog className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No Staff Found
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Add administrative staff to manage your school.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/staff/create">
                                        <Plus className="h-4 w-4" />
                                        Add Staff
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {staff.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {(staff.current_page - 1) * staff.per_page + 1} to{' '}
                            {Math.min(staff.current_page * staff.per_page, staff.total)} of {staff.total}
                        </p>
                        <div className="flex gap-2">
                            {staff.current_page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/staff?page=${staff.current_page - 1}`}>Previous</Link>
                                </Button>
                            )}
                            {staff.current_page < staff.last_page && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/staff?page=${staff.current_page + 1}`}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
