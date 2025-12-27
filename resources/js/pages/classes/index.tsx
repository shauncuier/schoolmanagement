import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Edit,
    MoreHorizontal,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    { title: 'Classes', href: '/classes' },
];

interface SchoolClass {
    id: number;
    name: string;
    numeric_name: string | null;
    description: string | null;
    order: number;
    is_active: boolean;
    sections_count: number;
}

interface Props {
    classes: PaginatedResponse<SchoolClass>;
}

export default function ClassesIndex({ classes }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!selectedClass) return;
        setIsDeleting(true);
        router.delete(`/classes/${selectedClass.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
                setSelectedClass(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Classes
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage class/grade levels for your school
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/classes/create">
                            <Plus className="h-4 w-4" />
                            Add Class
                        </Link>
                    </Button>
                </div>

                {/* Classes Grid */}
                {classes.data.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {classes.data.map((schoolClass) => (
                            <Card
                                key={schoolClass.id}
                                className={`relative transition-all duration-200 hover:shadow-lg ${!schoolClass.is_active ? 'opacity-60' : ''
                                    }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">
                                                    {schoolClass.name}
                                                </CardTitle>
                                                {schoolClass.numeric_name && (
                                                    <p className="text-xs text-gray-500">
                                                        Grade {schoolClass.numeric_name}
                                                    </p>
                                                )}
                                            </div>
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
                                                    <Link href={`/classes/${schoolClass.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        setSelectedClass(schoolClass);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    disabled={schoolClass.sections_count > 0}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                            <Users className="h-4 w-4" />
                                            <span>{schoolClass.sections_count} Sections</span>
                                        </div>
                                        <Badge variant={schoolClass.is_active ? 'default' : 'secondary'}>
                                            {schoolClass.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {schoolClass.description && (
                                        <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                                            {schoolClass.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <BookOpen className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No Classes
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Get started by creating your first class.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/classes/create">
                                <Plus className="h-4 w-4" />
                                Create Class
                            </Link>
                        </Button>
                    </Card>
                )}

                {/* Pagination */}
                {classes.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: classes.last_page }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={classes.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={`/classes?page=${i + 1}`}>{i + 1}</Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Class</DialogTitle>
                        <DialogDescription>
                            {selectedClass?.sections_count && selectedClass.sections_count > 0 ? (
                                <>Cannot delete "{selectedClass?.name}" because it has sections.</>
                            ) : (
                                <>Are you sure you want to delete "{selectedClass?.name}"? This action cannot be undone.</>
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
                            disabled={isDeleting || (selectedClass?.sections_count ?? 0) > 0}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
