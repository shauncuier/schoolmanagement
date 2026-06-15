import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Schedule {
    id: number;
    exam: string | null;
    subject: string | null;
    class: string | null;
    section: string | null;
    full_marks: number;
    pass_marks: number;
}

interface StudentRow {
    id: number;
    name: string;
    roll: string | null;
    marks_obtained: string | null;
    is_absent: boolean;
}

interface Props {
    schedule: Schedule;
    students: StudentRow[];
}

export default function MarksEntry({ schedule, students }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Exams', href: '/exams' },
        { title: 'Marks entry', href: `/exam-schedules/${schedule.id}/marks` },
    ];

    const [rows, setRows] = useState<Record<number, { marks: string; absent: boolean }>>(() =>
        Object.fromEntries(
            students.map((s) => [s.id, { marks: s.marks_obtained ?? '', absent: s.is_absent }]),
        ),
    );
    const [saving, setSaving] = useState(false);

    const update = (id: number, patch: Partial<{ marks: string; absent: boolean }>) => {
        setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    };

    const save = () => {
        const marks = students.map((s) => ({
            student_id: s.id,
            marks_obtained: rows[s.id].absent || rows[s.id].marks === '' ? null : Number(rows[s.id].marks),
            is_absent: rows[s.id].absent,
        }));
        router.put(`/exam-schedules/${schedule.id}/marks`, { marks }, {
            preserveScroll: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Marks entry" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{schedule.subject} — marks entry</h1>
                    <p className="text-muted-foreground">
                        {schedule.exam} · {schedule.class}
                        {schedule.section ? ` · ${schedule.section}` : ''} · Full marks {schedule.full_marks}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Students</CardTitle>
                        <CardDescription>Enter marks out of {schedule.full_marks}. Tick absent if applicable.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Roll</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="w-32 text-center">Marks</TableHead>
                                    <TableHead className="w-24 text-center">Absent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No active students in this class/section.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>{s.roll}</TableCell>
                                            <TableCell className="font-medium">{s.name}</TableCell>
                                            <TableCell className="text-center">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={schedule.full_marks}
                                                    value={rows[s.id].absent ? '' : rows[s.id].marks}
                                                    disabled={rows[s.id].absent}
                                                    onChange={(e) => update(s.id, { marks: e.target.value })}
                                                    className="mx-auto w-24 text-center"
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={rows[s.id].absent}
                                                    onCheckedChange={(v) => update(s.id, { absent: v === true })}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <Button onClick={save} disabled={saving || students.length === 0}>
                            <Save className="mr-2 h-4 w-4" />
                            Save marks
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
