import { Head, Link, router } from '@inertiajs/react';
import { Plus, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Exams', href: '/exams' },
];

interface ExamRow {
    id: number;
    name: string;
    status: string;
    is_published: boolean;
    start_date: string | null;
    end_date: string | null;
    schedules_count: number;
    report_cards_count: number;
}

export default function ExamsIndex({ exams }: { exams: ExamRow[] }) {
    const remove = (id: number) => {
        if (confirm('Delete this exam?')) {
            router.delete(`/exams/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exams" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
                        <p className="text-muted-foreground">Create exams, schedule subjects, and enter marks.</p>
                    </div>
                    <Button asChild>
                        <Link href="/exams/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Exam
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All exams</CardTitle>
                        <CardDescription>Open an exam to schedule subjects and enter marks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exam</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Subjects</TableHead>
                                    <TableHead className="text-center">Report cards</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No exams yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exams.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/exams/${exam.id}`} className="hover:underline">
                                                    {exam.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {exam.start_date} → {exam.end_date}
                                            </TableCell>
                                            <TableCell>
                                                {exam.is_published ? (
                                                    <Badge>
                                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Published
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">{exam.status}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">{exam.schedules_count}</TableCell>
                                            <TableCell className="text-center">{exam.report_cards_count}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/exams/${exam.id}`}>
                                                            <FileText className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => remove(exam.id)}>
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
            </div>
        </AppLayout>
    );
}
