import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, Megaphone, Undo2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
    { title: 'Results', href: '/exams/results' },
];

interface ExamRow {
    id: number;
    name: string;
    status: string;
    is_published: boolean;
    result_published_at: string | null;
    report_cards_count: number;
    published_cards_count: number;
    start_date: string | null;
}

interface Props {
    exams: ExamRow[];
}

export default function ResultsIndex({ exams }: Props) {
    const [notify, setNotify] = useState(false);

    const publish = (id: number) => {
        router.post(`/exams/${id}/publish`, { notify }, { preserveScroll: true });
    };

    const unpublish = (id: number) => {
        router.post(`/exams/${id}/unpublish`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Results" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Result publishing</h1>
                    <p className="text-muted-foreground">
                        Publish exam results so parents can look them up by roll number.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Exams</CardTitle>
                        <CardDescription>
                            Publishing makes every report card for an exam visible on the public lookup page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="notify"
                                checked={notify}
                                onCheckedChange={(v) => setNotify(v === true)}
                            />
                            <Label htmlFor="notify" className="text-sm font-normal">
                                Also SMS guardians when publishing
                            </Label>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exam</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Report cards</TableHead>
                                    <TableHead>Published</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No exams yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exams.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell className="font-medium">{exam.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{exam.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {exam.published_cards_count}/{exam.report_cards_count}
                                            </TableCell>
                                            <TableCell>
                                                {exam.is_published ? (
                                                    <Badge>
                                                        <CheckCircle2 className="mr-1 h-3 w-3" /> Published
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {exam.is_published ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => unpublish(exam.id)}
                                                    >
                                                        <Undo2 className="mr-2 h-4 w-4" />
                                                        Unpublish
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        disabled={exam.report_cards_count === 0}
                                                        onClick={() => publish(exam.id)}
                                                    >
                                                        <Megaphone className="mr-2 h-4 w-4" />
                                                        Publish
                                                    </Button>
                                                )}
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
