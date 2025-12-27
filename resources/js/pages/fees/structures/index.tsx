import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Edit, Layers, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Management', href: '/fees/categories' },
    { title: 'Structures', href: '/fees/structures' },
];

interface FeeCategory {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface AcademicYear {
    id: number;
    name: string;
}

interface FeeStructure {
    id: number;
    amount: number;
    due_date: string | null;
    late_fee: number;
    late_fee_grace_days: number;
    is_active: boolean;
    fee_category: FeeCategory;
    school_class: SchoolClass | null;
    academic_year: AcademicYear;
}

interface PaginatedData {
    data: FeeStructure[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    structures: PaginatedData;
    categories: FeeCategory[];
    classes: SchoolClass[];
    academicYears: AcademicYear[];
    filters: {
        category?: string;
        class?: string;
        academic_year?: string;
    };
}

export default function FeeStructuresIndex({ structures, categories = [], classes = [], academicYears = [], filters }: Props) {
    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const params = new URLSearchParams();
        const merged = { ...filters, ...newFilters };
        if (merged.category && merged.category !== 'all') params.set('category', merged.category);
        if (merged.class && merged.class !== 'all') params.set('class', merged.class);
        if (merged.academic_year && merged.academic_year !== 'all') params.set('academic_year', merged.academic_year);
        router.get(`/fees/structures?${params.toString()}`);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this fee structure?')) {
            router.delete(`/fees/structures/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fee Structures" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Fee Structures
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Set fee amounts per class and academic year
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/fees/structures/create">
                            <Plus className="h-4 w-4" />
                            Add Structure
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4">
                            <Select
                                value={filters.category ?? 'all'}
                                onValueChange={(v) => updateFilters({ category: v })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.class ?? 'all'}
                                onValueChange={(v) => updateFilters({ class: v })}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.academic_year ?? 'all'}
                                onValueChange={(v) => updateFilters({ academic_year: v })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Academic Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {academicYears.map((year) => (
                                        <SelectItem key={year.id} value={year.id.toString()}>{year.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {(structures.data?.length ?? 0) > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fee Category</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Late Fee</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {structures.data.map((structure) => (
                                        <TableRow key={structure.id}>
                                            <TableCell className="font-medium">
                                                {structure.fee_category?.name ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {structure.school_class?.name ?? 'All Classes'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {structure.academic_year?.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                ৳{Number(structure.amount).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {structure.due_date ? new Date(structure.due_date).toLocaleDateString() : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {structure.late_fee > 0 ? (
                                                    <span className="text-orange-600">
                                                        ৳{Number(structure.late_fee).toLocaleString()}
                                                        {structure.late_fee_grace_days > 0 && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                ({structure.late_fee_grace_days}d grace)
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={structure.is_active ? 'default' : 'secondary'}>
                                                    {structure.is_active ? 'Active' : 'Inactive'}
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
                                                            <Link href={`/fees/structures/${structure.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(structure.id)}
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
                                <Layers className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No Fee Structures
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Create fee structures to assign fees to classes.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/fees/structures/create">
                                        <Plus className="h-4 w-4" />
                                        Add Structure
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {structures.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {(structures.current_page - 1) * structures.per_page + 1} to{' '}
                            {Math.min(structures.current_page * structures.per_page, structures.total)} of {structures.total}
                        </p>
                        <div className="flex gap-2">
                            {structures.current_page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/fees/structures?page=${structures.current_page - 1}`}>Previous</Link>
                                </Button>
                            )}
                            {structures.current_page < structures.last_page && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/fees/structures?page=${structures.current_page + 1}`}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
