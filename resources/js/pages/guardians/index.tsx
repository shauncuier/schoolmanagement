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
    { title: 'Parents', href: '/guardians' },
];

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
}

interface Guardian {
    id: number;
    occupation: string | null;
    relation_type: string;
    is_primary_contact: boolean;
    is_active: boolean;
    user: User;
    students: Student[];
}

interface PaginatedData {
    data: Guardian[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    guardians: PaginatedData;
    filters: {
        status?: string;
        relation_type?: string;
        search?: string;
    };
}

const relationTypeLabels: Record<string, string> = {
    father: 'Father',
    mother: 'Mother',
    guardian: 'Guardian',
    uncle: 'Uncle',
    aunt: 'Aunt',
    grandparent: 'Grandparent',
    other: 'Other',
};

export default function GuardiansIndex({ guardians, filters }: Props) {
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
        if (merged.relation_type && merged.relation_type !== 'all') params.set('relation_type', merged.relation_type);
        router.get(`/guardians?${params.toString()}`);
    };

    const handleDelete = (guardianId: number) => {
        if (confirm('Are you sure you want to delete this parent/guardian?')) {
            router.delete(`/guardians/${guardianId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parents / Guardians" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Parents / Guardians
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage student guardians and parents
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/guardians/create">
                            <Plus className="h-4 w-4" />
                            Add Parent
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
                                        placeholder="Search by name, email, or phone..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Search</Button>
                            </form>
                            <Select
                                value={filters.relation_type ?? 'all'}
                                onValueChange={(v) => updateFilters({ relation_type: v })}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Relation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="father">Father</SelectItem>
                                    <SelectItem value="mother">Mother</SelectItem>
                                    <SelectItem value="guardian">Guardian</SelectItem>
                                    <SelectItem value="grandparent">Grandparent</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(v) => updateFilters({ status: v })}
                            >
                                <SelectTrigger className="w-[120px]">
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

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {(guardians.data?.length ?? 0) > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Parent / Guardian</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Relation</TableHead>
                                        <TableHead>Children</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {guardians.data.map((guardian) => (
                                        <TableRow key={guardian.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                                                        {guardian.user?.name?.charAt(0) ?? 'P'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{guardian.user?.name}</p>
                                                        <p className="text-sm text-gray-500">{guardian.user?.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{guardian.user?.phone ?? '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {relationTypeLabels[guardian.relation_type] ?? guardian.relation_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {guardian.students?.length ?? 0} student{(guardian.students?.length ?? 0) !== 1 ? 's' : ''}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={guardian.is_active ? 'default' : 'secondary'}>
                                                    {guardian.is_active ? 'Active' : 'Inactive'}
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
                                                            <Link href={`/guardians/${guardian.id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/guardians/${guardian.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(guardian.id)}
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
                                    No Parents Found
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Get started by adding the first parent/guardian.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/guardians/create">
                                        <Plus className="h-4 w-4" />
                                        Add Parent
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {guardians.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {(guardians.current_page - 1) * guardians.per_page + 1} to{' '}
                            {Math.min(guardians.current_page * guardians.per_page, guardians.total)} of {guardians.total}
                        </p>
                        <div className="flex gap-2">
                            {guardians.current_page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/guardians?page=${guardians.current_page - 1}`}>Previous</Link>
                                </Button>
                            )}
                            {guardians.current_page < guardians.last_page && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/guardians?page=${guardians.current_page + 1}`}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
