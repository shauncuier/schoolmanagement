import { Head, Link, router } from '@inertiajs/react';
import { Plus, Megaphone, Pencil, Trash2 } from 'lucide-react';
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
    { title: 'Notices', href: '/notices' },
];

interface NoticeRow {
    id: number;
    title: string;
    type: string;
    audience: string;
    is_published: boolean;
    publish_date: string | null;
    created_by: string | null;
}

export default function NoticesIndex({ notices }: { notices: NoticeRow[] }) {
    const remove = (id: number) => {
        if (confirm('Delete this notice?')) {
            router.delete(`/notices/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notices" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notices &amp; announcements</h1>
                        <p className="text-muted-foreground">Publish notices and optionally SMS the audience.</p>
                    </div>
                    <Button asChild>
                        <Link href="/notices/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Notice
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All notices</CardTitle>
                        <CardDescription>Most recent first.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Audience</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No notices yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    notices.map((n) => (
                                        <TableRow key={n.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                                                    {n.title}
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{n.type}</TableCell>
                                            <TableCell className="capitalize">{n.audience.replace('_', ' ')}</TableCell>
                                            <TableCell>
                                                {n.is_published ? (
                                                    <Badge>Published</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{n.publish_date}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/notices/${n.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => remove(n.id)}>
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
