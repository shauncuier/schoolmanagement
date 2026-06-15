import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fees', href: '/fees/payments' },
    { title: 'Payment status', href: '#' },
];

interface Intent {
    reference: string;
    status: string;
    amount: string;
    gateway: string;
    receipt: string | null;
}

export default function PaymentStatus({ intent }: { intent: Intent | null }) {
    const completed = intent?.status === 'completed';
    const pending = intent?.status === 'pending';

    const Icon = completed ? CheckCircle2 : pending ? Clock : XCircle;
    const tone = completed ? 'text-green-600' : pending ? 'text-amber-500' : 'text-destructive';

    const heading = !intent
        ? 'Payment not found'
        : completed
          ? 'Payment successful'
          : pending
            ? 'Payment pending'
            : 'Payment not completed';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment status" />

            <div className="mx-auto max-w-lg space-y-6">
                <Card>
                    <CardHeader className="items-center text-center">
                        <Icon className={`h-12 w-12 ${tone}`} />
                        <CardTitle className="mt-2">{heading}</CardTitle>
                        {intent && (
                            <CardDescription>Reference {intent.reference}</CardDescription>
                        )}
                    </CardHeader>
                    {intent && (
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-medium">BDT {intent.amount}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium capitalize">{intent.gateway}</span>
                            </div>
                            {intent.receipt && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Receipt</span>
                                    <span className="font-medium">{intent.receipt}</span>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>

                <div className="text-center">
                    <Button variant="outline" asChild>
                        <Link href="/fees/payments">Back to fees</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
