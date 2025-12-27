import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpenCheck,
    Edit,
    MoreHorizontal,
    Plus,
    Trash2,
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
    { title: 'Subjects', href: '/subjects' },
];

interface Subject {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    type: string;
    is_optional: boolean;
    is_active: boolean;
    class_subjects_count: number;
}

interface Props {
    subjects: PaginatedResponse<Subject>;
}

export default function SubjectsIndex({ subjects }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!selectedSubject) return;
        setIsDeleting(true);
        router.delete(`/subjects/${selectedSubject.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
                setSelectedSubject(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subjects" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Subjects
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage subjects offered in your school
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/subjects/create">
                            <Plus className="h-4 w-4" />
                            Add Subject
                        </Link>
                    </Button>
                </div>

                {/* Subjects Grid */}
                {subjects.data.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {subjects.data.map((subject) => (
                            <Card
                                key={subject.id}
                                className={`relative transition-all duration-200 hover:shadow-lg ${!subject.is_active ? 'opacity-60' : ''
                                    }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                                                <BookOpenCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">
                                                    {subject.name}
                                                </CardTitle>
                                                {subject.code && (
                                                    <p className="text-xs text-gray-500">
                                                        {subject.code}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/subjects/${subject.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        setSelectedSubject(subject);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    disabled={subject.class_subjects_count > 0}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <Badge variant={subject.is_active ? 'default' : 'secondary'}>
                                            {subject.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Badge variant={subject.is_optional ? 'outline' : 'default'}>
                                            {subject.is_optional ? 'Optional' : 'Mandatory'}
                                        </Badge>
                                        {subject.type && (
                                            <Badge variant="outline" className="capitalize">
                                                {subject.type}
                                            </Badge>
                                        )}
                                    </div>
                                    {subject.description && (
                                        <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                                            {subject.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <BookOpenCheck className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No Subjects
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Get started by creating your first subject.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/subjects/create">
                                <Plus className="h-4 w-4" />
                                Create Subject
                            </Link>
                        </Button>
                    </Card>
                )}

                {/* Pagination */}
                {subjects.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: subjects.last_page }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={subjects.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={`/subjects?page=${i + 1}`}>{i + 1}</Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Subject</DialogTitle>
                        <DialogDescription>
                            {selectedSubject?.class_subjects_count && selectedSubject.class_subjects_count > 0 ? (
                                <>Cannot delete "{selectedSubject?.name}" because it is assigned to classes.</>
                            ) : (
                                <>Are you sure you want to delete "{selectedSubject?.name}"? This action cannot be undone.</>
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
                            disabled={isDeleting || (selectedSubject?.class_subjects_count ?? 0) > 0}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
