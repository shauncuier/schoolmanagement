import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SchoolClass } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    UserCheck,
    UserX,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attendance', href: '/attendance' },
];

interface AttendanceSummary {
    total: number;
    present: number;
    absent: number;
    late: number;
}

interface Props {
    classes: (SchoolClass & { sections_count: number })[];
    attendanceSummary: Record<number, AttendanceSummary>;
    selectedDate: string;
}

export default function AttendanceIndex({ classes = [], attendanceSummary = {}, selectedDate }: Props) {
    const [date, setDate] = useState(selectedDate);

    const totalStats = Object.values(attendanceSummary).reduce(
        (acc, curr) => ({
            total: acc.total + curr.total,
            present: acc.present + curr.present,
            absent: acc.absent + curr.absent,
            late: acc.late + curr.late,
        }),
        { total: 0, present: 0, absent: 0, late: 0 }
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Attendance
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Mark and track student attendance
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-auto"
                        />
                        <Button asChild>
                            <Link href={`/attendance/select-section?date=${date}`}>
                                <UserCheck className="h-4 w-4" />
                                Mark Attendance
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/attendance/report">
                                <FileText className="h-4 w-4" />
                                Reports
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.total}</p>
                                <p className="text-sm text-gray-500">Total Marked</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.present}</p>
                                <p className="text-sm text-gray-500">Present</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                                <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.absent}</p>
                                <p className="text-sm text-gray-500">Absent</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalStats.late}</p>
                                <p className="text-sm text-gray-500">Late</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Classes Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Today's Attendance by Class
                        </CardTitle>
                        <CardDescription>
                            Attendance status for {new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(classes?.length ?? 0) > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {classes.map((cls) => {
                                    const summary = attendanceSummary[cls.id] || { total: 0, present: 0, absent: 0, late: 0 };
                                    return (
                                        <Card key={cls.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold">{cls.name}</h3>
                                                    <Badge variant="outline">
                                                        {cls.sections_count} sections
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                                    <div className="rounded bg-emerald-50 dark:bg-emerald-900/20 p-2">
                                                        <p className="font-bold text-emerald-600">{summary.present}</p>
                                                        <p className="text-xs text-gray-500">Present</p>
                                                    </div>
                                                    <div className="rounded bg-red-50 dark:bg-red-900/20 p-2">
                                                        <p className="font-bold text-red-600">{summary.absent}</p>
                                                        <p className="text-xs text-gray-500">Absent</p>
                                                    </div>
                                                    <div className="rounded bg-amber-50 dark:bg-amber-900/20 p-2">
                                                        <p className="font-bold text-amber-600">{summary.late}</p>
                                                        <p className="text-xs text-gray-500">Late</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-gray-500">No classes found. Create classes first.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
