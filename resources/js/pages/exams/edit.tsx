import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Option {
    id: number;
    name: string;
}

interface ExamData {
    id: number;
    name: string;
    exam_type_id: number;
    academic_year_id: number;
    grading_system_id: number | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
    status: string;
}

interface Props {
    exam: ExamData;
    examTypes: Option[];
    academicYears: Option[];
    gradingSystems: Option[];
}

export default function ExamEdit({ exam, examTypes, academicYears, gradingSystems }: Props) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Exams', href: '/exams' },
        { title: exam.name, href: `/exams/${exam.id}` },
        { title: 'Edit', href: `/exams/${exam.id}/edit` },
    ];

    const form = useForm({
        name: exam.name,
        exam_type_id: String(exam.exam_type_id),
        academic_year_id: String(exam.academic_year_id),
        grading_system_id: exam.grading_system_id ? String(exam.grading_system_id) : '',
        start_date: exam.start_date ?? '',
        end_date: exam.end_date ?? '',
        description: exam.description ?? '',
        status: exam.status,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/exams/${exam.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${exam.name}`} />

            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Edit exam</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Exam details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                />
                                {form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Exam type</Label>
                                    <Select value={form.data.exam_type_id} onValueChange={(v) => form.setData('exam_type_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {examTypes.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Academic year</Label>
                                    <Select value={form.data.academic_year_id} onValueChange={(v) => form.setData('academic_year_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((y) => (
                                                <SelectItem key={y.id} value={String(y.id)}>
                                                    {y.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Grading system</Label>
                                    <Select value={form.data.grading_system_id} onValueChange={(v) => form.setData('grading_system_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Default GPA 5.0" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradingSystems.map((g) => (
                                                <SelectItem key={g.id} value={String(g.id)}>
                                                    {g.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={form.data.status} onValueChange={(v) => form.setData('status', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['upcoming', 'ongoing', 'completed', 'cancelled'].map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={form.data.start_date}
                                        onChange={(e) => form.setData('start_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={form.data.end_date}
                                        onChange={(e) => form.setData('end_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <Button type="submit" disabled={form.processing}>
                                Save changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
