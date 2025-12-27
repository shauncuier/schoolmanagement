import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SchoolClass } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
import { ArrowLeft, BarChart3, Download, FileText } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attendance', href: '/attendance' },
    { title: 'Report', href: '/attendance/report' },
];

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface AttendanceData {
    student_id: number;
    student_name: string;
    total_days: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
}

interface Filters {
    class_id?: string;
    section_id?: string;
    start_date: string;
    end_date: string;
}

interface Props {
    classes: SchoolClass[];
    sections: Section[];
    filters: Filters;
    attendanceData: AttendanceData[];
}

export default function AttendanceReport({ classes = [], sections = [], filters, attendanceData = [] }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);

    const filteredSections = (sections ?? []).filter(
        (s) => s.class_id.toString() === localFilters.class_id
    );

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (localFilters.class_id) params.set('class_id', localFilters.class_id);
        if (localFilters.section_id) params.set('section_id', localFilters.section_id);
        if (localFilters.start_date) params.set('start_date', localFilters.start_date);
        if (localFilters.end_date) params.set('end_date', localFilters.end_date);
        router.get(`/attendance/report?${params.toString()}`);
    };

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-emerald-100 text-emerald-700';
        if (percentage >= 75) return 'bg-blue-100 text-blue-700';
        if (percentage >= 60) return 'bg-amber-100 text-amber-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Report" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/attendance">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Attendance Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            View attendance statistics and trends
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Filter Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select
                                    value={localFilters.class_id ?? ''}
                                    onValueChange={(v) => {
                                        setLocalFilters({ ...localFilters, class_id: v, section_id: '' });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(classes ?? []).map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Section</Label>
                                <Select
                                    value={localFilters.section_id ?? ''}
                                    onValueChange={(v) => setLocalFilters({ ...localFilters, section_id: v })}
                                    disabled={!localFilters.class_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={localFilters.class_id ? 'Select section' : 'Select class first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSections.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                Section {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={localFilters.start_date}
                                    onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={localFilters.end_date}
                                    onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={applyFilters} className="w-full">
                                    Generate Report
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Data */}
                {filters.section_id ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Attendance Summary
                            </CardTitle>
                            <CardDescription>
                                {filters.start_date} to {filters.end_date}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(attendanceData?.length ?? 0) > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead className="text-center">Total Days</TableHead>
                                            <TableHead className="text-center">Present</TableHead>
                                            <TableHead className="text-center">Absent</TableHead>
                                            <TableHead className="text-center">Late</TableHead>
                                            <TableHead className="text-center">Attendance %</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendanceData.map((row, index) => (
                                            <TableRow key={row.student_id}>
                                                <TableCell className="font-mono text-sm text-gray-500">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {row.student_name}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {row.total_days}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-emerald-100 text-emerald-700">
                                                        {row.present}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-red-100 text-red-700">
                                                        {row.absent}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-amber-100 text-amber-700">
                                                        {row.late}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={getPercentageColor(row.percentage)}>
                                                        {row.percentage}%
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">No attendance data found for the selected period.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <BarChart3 className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Select a Section
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Choose a class and section to view the attendance report.
                        </p>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
