import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Smartphone, CreditCard, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fees', href: '/fees/payments' },
    { title: 'Pay', href: '#' },
];

interface Allocation {
    id: number;
    student: string | null;
    category: string | null;
    net_amount: string;
    paid_amount: string;
    due_amount: string;
    status: string;
}

interface Props {
    allocation: Allocation;
    gateways: string[];
    currency: string;
}

const GATEWAY_META: Record<string, { label: string; icon: typeof Smartphone }> = {
    sandbox: { label: 'Sandbox (test)', icon: Wallet },
    bkash: { label: 'bKash', icon: Smartphone },
    nagad: { label: 'Nagad', icon: Smartphone },
    rocket: { label: 'Rocket', icon: CreditCard },
};

export default function PayFee({ allocation, gateways, currency }: Props) {
    const [selected, setSelected] = useState(gateways[0] ?? 'sandbox');
    const form = useForm({ gateway: gateways[0] ?? 'sandbox' });

    const pay = () => {
        form.transform(() => ({ gateway: selected }));
        form.post(`/fees/pay/${allocation.id}`);
    };

    const due = Number(allocation.due_amount);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pay fee" />

            <div className="mx-auto max-w-lg space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Pay fee online</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>{allocation.category ?? 'Fee'}</CardTitle>
                        <CardDescription>{allocation.student}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total</span>
                            <span>{currency} {allocation.net_amount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Paid</span>
                            <span>{currency} {allocation.paid_amount}</span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                            <span className="font-medium">Amount due</span>
                            <span className="text-2xl font-bold">
                                {currency} {allocation.due_amount}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {due <= 0 ? (
                    <Card>
                        <CardContent className="py-6 text-center">
                            <Badge>Paid</Badge>
                            <p className="mt-2 text-sm text-muted-foreground">This fee is fully paid.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Choose a payment method</CardTitle>
                            <CardDescription>You'll be redirected to complete the payment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {gateways.map((g) => {
                                    const meta = GATEWAY_META[g] ?? { label: g, icon: Wallet };
                                    const Icon = meta.icon;
                                    return (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setSelected(g)}
                                            className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition ${
                                                selected === g
                                                    ? 'border-primary ring-1 ring-primary'
                                                    : 'border-border hover:bg-muted'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {meta.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {form.errors.gateway && (
                                <p className="text-sm text-destructive">{form.errors.gateway}</p>
                            )}
                            <Button onClick={pay} disabled={form.processing} className="w-full">
                                Pay {currency} {allocation.due_amount}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
