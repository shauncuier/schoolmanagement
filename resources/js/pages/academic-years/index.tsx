import AppLayout from '@/layouts/app-layout';
import { type AcademicYear, type BreadcrumbItem, type PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    MoreHorizontal,
    Plus,
    Star,
    Trash2,
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Academic Years', href: '/academic-years' },
];

interface Props {
    academicYears: PaginatedResponse<AcademicYear>;
}

function getStatusBadge(status: AcademicYear['status']) {
    const variants: Record<AcademicYear['status'], { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
        active: { variant: 'default', label: 'Active' },
        completed: { variant: 'secondary', label: 'Completed' },
        upcoming: { variant: 'outline', label: 'Upcoming' },
    };
    return variants[status] || variants.upcoming;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function AcademicYearsIndex({ academicYears }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!selectedYear) return;
        setIsDeleting(true);
        router.delete(`/academic-years/${selectedYear.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
                setSelectedYear(null);
            },
        });
    };

    const handleSetCurrent = (year: AcademicYear) => {
        router.post(`/academic-years/${year.id}/set-current`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Academic Years" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Academic Years
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage academic years for your school
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/academic-years/create">
                            <Plus className="h-4 w-4" />
                            Add Academic Year
                        </Link>
                    </Button>
                </div>

                {/* Academic Years Grid */}
                {academicYears.data.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {academicYears.data.map((year) => {
                            const status = getStatusBadge(year.status);
                            return (
                                <Card
                                    key={year.id}
                                    className={`relative transition-all duration-200 hover:shadow-lg ${year.is_current
                                            ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                                            : ''
                                        }`}
                                >
                                    {year.is_current && (
                                        <div className="absolute -top-2 -right-2">
                                            <span className="flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white shadow-lg">
                                                <Star className="h-3 w-3" />
                                                Current
                                            </span>
                                        </div>
                                    )}
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {year.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    <Badge variant={status.variant}>
                                                        {status.label}
                                                    </Badge>
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/academic-years/${year.id}/edit`}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {!year.is_current && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleSetCurrent(year)
                                                            }
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Set as Current
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            setSelectedYear(year);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span>{formatDate(year.start_date)}</span>
                                            </div>
                                            <span className="text-gray-400">→</span>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>{formatDate(year.end_date)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <Calendar className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No Academic Years
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Get started by creating your first academic year.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/academic-years/create">
                                <Plus className="h-4 w-4" />
                                Create Academic Year
                            </Link>
                        </Button>
                    </Card>
                )}

                {/* Pagination */}
                {academicYears.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: academicYears.last_page }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={
                                    academicYears.current_page === i + 1
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                asChild
                            >
                                <Link href={`/academic-years?page=${i + 1}`}>
                                    {i + 1}
                                </Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Academic Year</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedYear?.name}"? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
