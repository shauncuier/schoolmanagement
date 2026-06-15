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

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Exams', href: '/exams' },
    { title: 'New', href: '/exams/create' },
];

interface Option {
    id: number;
    name: string;
}

interface Props {
    examTypes: Option[];
    academicYears: Option[];
    gradingSystems: Option[];
}

export default function ExamCreate({ examTypes, academicYears, gradingSystems }: Props) {
    const form = useForm({
        name: '',
        exam_type_id: '',
        academic_year_id: '',
        grading_system_id: '',
        start_date: '',
        end_date: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/exams');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New exam" />

            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">New exam</h1>

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
                                    placeholder="Final Examination 2025"
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
                                    {form.errors.exam_type_id && (
                                        <p className="text-sm text-destructive">{form.errors.exam_type_id}</p>
                                    )}
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
                                    {form.errors.academic_year_id && (
                                        <p className="text-sm text-destructive">{form.errors.academic_year_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Grading system (optional)</Label>
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

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={form.data.start_date}
                                        onChange={(e) => form.setData('start_date', e.target.value)}
                                    />
                                    {form.errors.start_date && (
                                        <p className="text-sm text-destructive">{form.errors.start_date}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={form.data.end_date}
                                        onChange={(e) => form.setData('end_date', e.target.value)}
                                    />
                                    {form.errors.end_date && (
                                        <p className="text-sm text-destructive">{form.errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <Button type="submit" disabled={form.processing}>
                                Create exam
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
