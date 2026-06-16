import { Head } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
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
    { title: 'Fees', href: '/fees/payments' },
    { title: 'Refunds', href: '/fees/refunds' },
];

interface RefundRow {
    id: number;
    receipt: string | null;
    amount: string;
    reason: string;
    status: string;
    processed_by: string | null;
    processed_at: string | null;
}

export default function RefundsIndex({ refunds }: { refunds: RefundRow[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Refunds" />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <RotateCcw className="h-7 w-7 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Fee refunds</h1>
                        <p className="text-muted-foreground">Refunds processed against fee payments.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Refund history</CardTitle>
                        <CardDescription>Most recent first.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Receipt</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>By</TableHead>
                                    <TableHead>When</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {refunds.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No refunds yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    refunds.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium">{r.receipt ?? '—'}</TableCell>
                                            <TableCell className="text-right">৳{r.amount}</TableCell>
                                            <TableCell className="max-w-[240px] truncate" title={r.reason}>{r.reason}</TableCell>
                                            <TableCell><Badge>{r.status}</Badge></TableCell>
                                            <TableCell>{r.processed_by ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground">{r.processed_at}</TableCell>
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
