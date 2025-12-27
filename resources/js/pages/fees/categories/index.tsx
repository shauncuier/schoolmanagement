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
import { Edit, FolderOpen, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Management', href: '/fees/categories' },
    { title: 'Categories', href: '/fees/categories' },
];

interface FeeCategory {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    frequency: string;
    is_mandatory: boolean;
    is_active: boolean;
}

interface PaginatedData {
    data: FeeCategory[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    categories: PaginatedData;
    filters: {
        status?: string;
        search?: string;
    };
}

const frequencyLabels: Record<string, string> = {
    one_time: 'One Time',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    half_yearly: 'Half Yearly',
    yearly: 'Yearly',
};

export default function FeeCategoriesIndex({ categories, filters }: Props) {
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
        router.get(`/fees/categories?${params.toString()}`);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/fees/categories/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fee Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Fee Categories
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage fee types (Tuition, Transport, Library, etc.)
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/fees/categories/create">
                            <Plus className="h-4 w-4" />
                            Add Category
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
                                        placeholder="Search categories..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Search</Button>
                            </form>
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
                        {(categories.data?.length ?? 0) > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Mandatory</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.data.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{category.name}</p>
                                                    {category.description && (
                                                        <p className="text-sm text-gray-500 truncate max-w-xs">
                                                            {category.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {category.code && (
                                                    <Badge variant="outline">{category.code}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {frequencyLabels[category.frequency] ?? category.frequency}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {category.is_mandatory ? (
                                                    <Badge variant="default">Mandatory</Badge>
                                                ) : (
                                                    <Badge variant="outline">Optional</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
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
                                                            <Link href={`/fees/categories/${category.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(category.id)}
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
                                <FolderOpen className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No Fee Categories
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Create fee categories to set up fee structures.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/fees/categories/create">
                                        <Plus className="h-4 w-4" />
                                        Add Category
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {categories.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {(categories.current_page - 1) * categories.per_page + 1} to{' '}
                            {Math.min(categories.current_page * categories.per_page, categories.total)} of {categories.total}
                        </p>
                        <div className="flex gap-2">
                            {categories.current_page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/fees/categories?page=${categories.current_page - 1}`}>Previous</Link>
                                </Button>
                            )}
                            {categories.current_page < categories.last_page && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/fees/categories?page=${categories.current_page + 1}`}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
