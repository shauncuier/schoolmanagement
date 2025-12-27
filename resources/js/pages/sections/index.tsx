import AppLayout from '@/layouts/app-layout';
import { type AcademicYear, type BreadcrumbItem, type PaginatedResponse, type SchoolClass } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    Layers,
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
    { title: 'Sections', href: '/sections' },
];

interface Section {
    id: number;
    name: string;
    capacity: number;
    room_number: string | null;
    is_active: boolean;
    students_count: number;
    school_class: SchoolClass;
    academic_year: AcademicYear;
    class_teacher: { id: number; name: string } | null;
}

interface Props {
    sections: PaginatedResponse<Section>;
    classes: SchoolClass[];
    academicYears: AcademicYear[];
    filters: {
        class_id?: string;
        academic_year_id?: string;
    };
}

export default function SectionsIndex({ sections, classes = [], academicYears = [] }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!selectedSection) return;
        setIsDeleting(true);
        router.delete(`/sections/${selectedSection.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
                setSelectedSection(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sections" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Sections
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage sections for each class
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/sections/create">
                            <Plus className="h-4 w-4" />
                            Add Section
                        </Link>
                    </Button>
                </div>

                {/* Sections Grid */}
                {(sections?.data?.length ?? 0) > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sections.data.map((section) => (
                            <Card
                                key={section.id}
                                className={`relative transition-all duration-200 hover:shadow-lg ${!section.is_active ? 'opacity-60' : ''
                                    }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">
                                                {section.school_class.name} - {section.name}
                                            </CardTitle>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {section.academic_year.name}
                                            </p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/sections/${section.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => {
                                                        setSelectedSection(section);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    disabled={section.students_count > 0}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                                <Users className="h-4 w-4" />
                                                <span>
                                                    {section.students_count} / {section.capacity} Students
                                                </span>
                                            </div>
                                            <Badge variant={section.is_active ? 'default' : 'secondary'}>
                                                {section.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        {section.class_teacher && (
                                            <p className="text-xs text-gray-500">
                                                Teacher: {section.class_teacher.name}
                                            </p>
                                        )}
                                        {section.room_number && (
                                            <p className="text-xs text-gray-500">
                                                Room: {section.room_number}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <Layers className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No Sections
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {(classes ?? []).length === 0
                                ? 'Create classes first before adding sections.'
                                : 'Get started by creating your first section.'}
                        </p>
                        {(classes ?? []).length > 0 && (
                            <Button asChild className="mt-4">
                                <Link href="/sections/create">
                                    <Plus className="h-4 w-4" />
                                    Create Section
                                </Link>
                            </Button>
                        )}
                    </Card>
                )}

                {/* Pagination */}
                {sections.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: sections.last_page }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={sections.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={`/sections?page=${i + 1}`}>{i + 1}</Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Section</DialogTitle>
                        <DialogDescription>
                            {selectedSection?.students_count && selectedSection.students_count > 0 ? (
                                <>Cannot delete this section because it has enrolled students.</>
                            ) : (
                                <>Are you sure you want to delete this section? This action cannot be undone.</>
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
                            disabled={isDeleting || (selectedSection?.students_count ?? 0) > 0}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
