import { Head, useForm } from '@inertiajs/react';
import { GraduationCap, Search } from 'lucide-react';
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

interface Subject {
    subject: string | null;
    marks: string | null;
    grade: string | null;
    grade_point: string | null;
    is_absent: boolean;
}

interface ResultData {
    student: { name: string; roll: string | null; admission_no: string | null };
    exam: { name: string };
    summary: {
        gpa: string | null;
        grade: string | null;
        percentage: string | null;
        rank: number | null;
        total_students: number | null;
        result: string;
    };
    subjects: Subject[];
}

interface Props {
    school: { name: string; slug: string; logo: string | null };
    exams: { id: number; name: string }[];
    result?: ResultData | null;
    searched?: boolean;
    query?: { exam_id: string; roll: string };
}

export default function PublicResults({ school, exams, result, searched, query }: Props) {
    const form = useForm({
        exam_id: query?.exam_id ?? '',
        roll: query?.roll ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/results/${school.slug}`, { preserveScroll: true, preserveState: true });
    };

    return (
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
            <Head title={`Results — ${school.name}`} />

            <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
                    <p className="text-sm text-muted-foreground">Exam result lookup</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Find your result</CardTitle>
                    <CardDescription>Select the exam and enter your roll number.</CardDescription>
                </CardHeader>
                <CardContent>
                    {exams.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No results have been published yet.</p>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Exam</Label>
                                <Select
                                    value={form.data.exam_id}
                                    onValueChange={(v) => form.setData('exam_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select exam" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {exams.map((exam) => (
                                            <SelectItem key={exam.id} value={String(exam.id)}>
                                                {exam.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.exam_id && (
                                    <p className="text-sm text-destructive">{form.errors.exam_id}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roll">Roll number</Label>
                                <Input
                                    id="roll"
                                    value={form.data.roll}
                                    onChange={(e) => form.setData('roll', e.target.value)}
                                    placeholder="e.g. 7"
                                />
                                {form.errors.roll && (
                                    <p className="text-sm text-destructive">{form.errors.roll}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={form.processing}>
                                <Search className="mr-2 h-4 w-4" />
                                Find result
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            {searched && !result && (
                <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                        No published result found for that roll number.
                    </CardContent>
                </Card>
            )}

            {result && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{result.student.name}</CardTitle>
                                <CardDescription>
                                    Roll {result.student.roll} · {result.exam.name}
                                </CardDescription>
                            </div>
                            <Badge variant={result.summary.result === 'pass' ? 'default' : 'destructive'}>
                                {result.summary.result.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">GPA</p>
                                <p className="text-2xl font-bold">{result.summary.gpa ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Grade</p>
                                <p className="text-2xl font-bold">{result.summary.grade ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Rank</p>
                                <p className="text-2xl font-bold">
                                    {result.summary.rank ?? '—'}
                                    {result.summary.total_students ? `/${result.summary.total_students}` : ''}
                                </p>
                            </div>
                        </div>

                        {result.subjects.length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject</TableHead>
                                        <TableHead className="text-center">Marks</TableHead>
                                        <TableHead className="text-center">Grade</TableHead>
                                        <TableHead className="text-center">GP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.subjects.map((s, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{s.subject ?? '—'}</TableCell>
                                            <TableCell className="text-center">
                                                {s.is_absent ? 'Absent' : (s.marks ?? '—')}
                                            </TableCell>
                                            <TableCell className="text-center">{s.grade ?? '—'}</TableCell>
                                            <TableCell className="text-center">{s.grade_point ?? '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
