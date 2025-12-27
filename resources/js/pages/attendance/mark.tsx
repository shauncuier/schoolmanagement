import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ToggleGroup,
    ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { ArrowLeft, CheckCircle, Clock, Save, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Section {
    id: number;
    name: string;
    school_class: { id: number; name: string };
    academic_year: { id: number; name: string } | null;
}

interface StudentWithAttendance {
    id: number;
    name: string;
    roll_number: string | null;
    admission_no: string;
    status: string | null;
    remarks: string;
    attendance_id: number | null;
}

interface Props {
    section: Section;
    students: StudentWithAttendance[];
    date: string;
    isMarked: boolean;
}

interface AttendanceRecord {
    student_id: number;
    status: string;
    remarks: string;
}



export default function MarkAttendance({ section, students = [], date, isMarked }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Attendance', href: '/attendance' },
        { title: `${section.school_class?.name} - ${section.name}`, href: '#' },
    ];

    // Initialize attendance state from existing data or defaults
    const [attendance, setAttendance] = useState<Record<number, AttendanceRecord>>(() => {
        const initial: Record<number, AttendanceRecord> = {};
        (students ?? []).forEach((student) => {
            initial[student.id] = {
                student_id: student.id,
                status: student.status || 'present',
                remarks: student.remarks || '',
            };
        });
        return initial;
    });

    const [isSaving, setIsSaving] = useState(false);
    // Reusing useForm only for overall site consistency if needed, but router is better for this complex state

    const updateStatus = (studentId: number, status: string) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], status },
        }));
    };

    const updateRemarks = (studentId: number, remarks: string) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks },
        }));
    };

    const markAll = (status: string) => {
        const updated: Record<number, AttendanceRecord> = {};
        (students ?? []).forEach((student) => {
            updated[student.id] = {
                ...attendance[student.id],
                status,
            };
        });
        setAttendance(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/attendance', {
            section_id: section.id,
            date,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            attendance: Object.values(attendance) as unknown as any,
        }, {
            onStart: () => setIsSaving(true),
            onFinish: () => setIsSaving(false),
        });
    };

    const stats = {
        present: Object.values(attendance).filter((a) => a.status === 'present').length,
        absent: Object.values(attendance).filter((a) => a.status === 'absent').length,
        late: Object.values(attendance).filter((a) => a.status === 'late').length,
        excused: Object.values(attendance).filter((a) => a.status === 'excused').length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Mark Attendance - ${section.school_class?.name} ${section.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/attendance/select-section">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Mark Attendance
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{section.school_class?.name} - Section {section.name}</span>
                                <span>•</span>
                                <span>{new Date(date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}</span>
                                {isMarked && (
                                    <Badge variant="secondary">Already Marked</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <Badge className="bg-emerald-100 text-emerald-700">
                            Present: {stats.present}
                        </Badge>
                        <Badge className="bg-red-100 text-red-700">
                            Absent: {stats.absent}
                        </Badge>
                        <Badge className="bg-amber-100 text-amber-700">
                            Late: {stats.late}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-700">
                            Excused: {stats.excused}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => markAll('present')}>
                            Mark All Present
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => markAll('absent')}>
                            Mark All Absent
                        </Button>
                    </div>
                </div>

                {/* Attendance Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Attendance</CardTitle>
                            <CardDescription>
                                {students?.length ?? 0} students • Click status to change
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(students?.length ?? 0) > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">#</TableHead>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Roll No</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student, index) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-mono text-sm text-gray-500">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.admission_no}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{student.roll_number ?? '-'}</TableCell>
                                                <TableCell>
                                                    <ToggleGroup
                                                        type="single"
                                                        value={attendance[student.id]?.status}
                                                        onValueChange={(v) => v && updateStatus(student.id, v)}
                                                        className="justify-start"
                                                    >
                                                        <ToggleGroupItem
                                                            value="present"
                                                            className="data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-700"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem
                                                            value="absent"
                                                            className="data-[state=on]:bg-red-100 data-[state=on]:text-red-700"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem
                                                            value="late"
                                                            className="data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700"
                                                        >
                                                            <Clock className="h-4 w-4" />
                                                        </ToggleGroupItem>
                                                        <ToggleGroupItem
                                                            value="excused"
                                                            className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
                                                        >
                                                            <UserX className="h-4 w-4" />
                                                        </ToggleGroupItem>
                                                    </ToggleGroup>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Optional remarks"
                                                        value={attendance[student.id]?.remarks ?? ''}
                                                        onChange={(e) => updateRemarks(student.id, e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">No students found in this section.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    {(students?.length ?? 0) > 0 && (
                        <div className="mt-4 flex justify-end">
                            <Button type="submit" disabled={isSaving} size="lg">
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Saving...' : isMarked ? 'Update Attendance' : 'Save Attendance'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
