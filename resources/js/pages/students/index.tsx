import AppLayout from '@/layouts/app-layout';
import { type AcademicYear, type BreadcrumbItem, type PaginatedResponse, type SchoolClass } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    Eye,
    GraduationCap,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    UserCircle,
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    { title: 'Students', href: '/students' },
];

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Student {
    id: number;
    admission_no: string;
    roll_number: string | null;
    status: string;
    date_of_birth: string | null;
    gender: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
    school_class: SchoolClass | null;
    section: Section | null;
    academic_year: AcademicYear | null;
}

interface Filters {
    class_id?: string;
    section_id?: string;
    status?: string;
    search?: string;
}

interface Props {
    students: PaginatedResponse<Student>;
    classes: SchoolClass[];
    filters: Filters;
}

const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    graduated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    transferred: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function StudentsIndex({ students, classes = [], filters }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const handleDelete = () => {
        if (!selectedStudent) return;
        setIsDeleting(true);
        router.delete(`/students/${selectedStudent.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
                setSelectedStudent(null);
            },
        });
    };

    const applyFilter = (key: string, value: string) => {
        const params = new URLSearchParams();
        const newFilters = { ...filters, [key]: value };

        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== 'all') params.set(k, v);
        });

        router.get(`/students?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', searchValue);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Students
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage student records and profiles
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/students/create">
                            <Plus className="h-4 w-4" />
                            Add Student
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, email, or admission no..."
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
                                    value={filters.class_id ?? 'all'}
                                    onValueChange={(v) => applyFilter('class_id', v)}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {(classes ?? []).map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.status ?? 'all'}
                                    onValueChange={(v) => applyFilter('status', v)}
                                >
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="graduated">Graduated</SelectItem>
                                        <SelectItem value="transferred">Transferred</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table */}
                {(students?.data?.length ?? 0) > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Admission No</TableHead>
                                        <TableHead>Class / Section</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.data.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                                        <UserCircle className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {student.user?.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {student.user?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {student.admission_no}
                                            </TableCell>
                                            <TableCell>
                                                {student.school_class?.name ?? '-'}
                                                {student.section && ` - ${student.section.name}`}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[student.status] ?? ''}>
                                                    {student.status}
                                                </Badge>
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
                                                            <Link href={`/students/${student.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/students/${student.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <GraduationCap className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No Students Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {filters.search || filters.class_id || filters.status
                                ? 'Try adjusting your search or filters.'
                                : 'Get started by adding your first student.'}
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/students/create">
                                <Plus className="h-4 w-4" />
                                Add Student
                            </Link>
                        </Button>
                    </Card>
                )}

                {/* Pagination */}
                {(students?.last_page ?? 0) > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: students.last_page }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={students.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={`/students?page=${i + 1}`}>{i + 1}</Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Student</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedStudent?.user?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
