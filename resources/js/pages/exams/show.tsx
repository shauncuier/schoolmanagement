import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { Pencil, Trash2, ClipboardList, FileBadge } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Exam {
    id: number;
    name: string;
    status: string;
    is_published: boolean;
    start_date: string | null;
    end_date: string | null;
}

interface Schedule {
    id: number;
    subject: string | null;
    class: string | null;
    section: string | null;
    date: string | null;
    full_marks: number;
    pass_marks: number;
    results_count: number;
}

interface Option {
    id: number;
    name: string;
    class_id?: number;
}

interface Props {
    exam: Exam;
    schedules: Schedule[];
    classes: Option[];
    sections: Option[];
    subjects: Option[];
}

export default function ExamShow({ exam, schedules, classes, sections, subjects }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Exams', href: '/exams' },
        { title: exam.name, href: `/exams/${exam.id}` },
    ];

    const form = useForm({
        class_id: '',
        section_id: '',
        subject_id: '',
        date: '',
        start_time: '',
        end_time: '',
        full_marks: '100',
        pass_marks: '33',
    });

    const sectionOptions = useMemo(
        () => sections.filter((s) => String(s.class_id) === form.data.class_id),
        [sections, form.data.class_id],
    );

    const addSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/exams/${exam.id}/schedules`, {
            preserveScroll: true,
            onSuccess: () => form.reset('subject_id', 'date', 'start_time', 'end_time'),
        });
    };

    const removeSchedule = (id: number) => {
        if (confirm('Remove this subject schedule?')) {
            router.delete(`/exam-schedules/${id}`, { preserveScroll: true });
        }
    };

    const generate = () => {
        router.post(`/exams/${exam.id}/report-cards`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={exam.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{exam.name}</h1>
                        <p className="text-muted-foreground">
                            {exam.start_date} → {exam.end_date}{' '}
                            {exam.is_published ? (
                                <Badge className="ml-2">Published</Badge>
                            ) : (
                                <Badge variant="outline" className="ml-2">
                                    {exam.status}
                                </Badge>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/exams/${exam.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button onClick={generate} disabled={schedules.length === 0}>
                            <FileBadge className="mr-2 h-4 w-4" />
                            Generate report cards
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Subject schedule</CardTitle>
                        <CardDescription>Enter marks per subject; then generate report cards.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Class / Section</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-center">Full / Pass</TableHead>
                                    <TableHead className="text-center">Entered</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No subjects scheduled yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    schedules.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium">{s.subject}</TableCell>
                                            <TableCell>
                                                {s.class}
                                                {s.section ? ` · ${s.section}` : ''}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{s.date}</TableCell>
                                            <TableCell className="text-center">
                                                {s.full_marks} / {s.pass_marks}
                                            </TableCell>
                                            <TableCell className="text-center">{s.results_count}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/exam-schedules/${s.id}/marks`}>
                                                            <ClipboardList className="mr-2 h-4 w-4" />
                                                            Marks
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => removeSchedule(s.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add a subject</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={addSchedule} className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select
                                    value={form.data.class_id}
                                    onValueChange={(v) => {
                                        form.setData('class_id', v);
                                        form.setData('section_id', '');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.class_id && <p className="text-sm text-destructive">{form.errors.class_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Section (optional)</Label>
                                <Select value={form.data.section_id} onValueChange={(v) => form.setData('section_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All sections" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionOptions.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select value={form.data.subject_id} onValueChange={(v) => form.setData('subject_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.subject_id && <p className="text-sm text-destructive">{form.errors.subject_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start</Label>
                                <Input id="start_time" type="time" value={form.data.start_time} onChange={(e) => form.setData('start_time', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_time">End</Label>
                                <Input id="end_time" type="time" value={form.data.end_time} onChange={(e) => form.setData('end_time', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="full_marks">Full marks</Label>
                                <Input id="full_marks" type="number" value={form.data.full_marks} onChange={(e) => form.setData('full_marks', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pass_marks">Pass marks</Label>
                                <Input id="pass_marks" type="number" value={form.data.pass_marks} onChange={(e) => form.setData('pass_marks', e.target.value)} />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" disabled={form.processing}>
                                    Add subject
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
