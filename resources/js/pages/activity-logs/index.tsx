import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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
    { title: 'Activity log', href: '/activity-logs' },
];

interface LogRow {
    id: number;
    action: string;
    description: string | null;
    user: string | null;
    ip_address: string | null;
    properties: Record<string, unknown> | null;
    created_at: string | null;
}

export default function ActivityLogIndex({ logs }: { logs: LogRow[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity log" />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Activity log</h1>
                        <p className="text-muted-foreground">Audit trail of sensitive actions.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent activity</CardTitle>
                        <CardDescription>Last 200 entries.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>IP</TableHead>
                                    <TableHead>When</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No activity recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Badge variant="outline">{log.action}</Badge>
                                            </TableCell>
                                            <TableCell>{log.description ?? '—'}</TableCell>
                                            <TableCell>{log.user ?? 'System'}</TableCell>
                                            <TableCell className="text-muted-foreground">{log.ip_address ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
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
