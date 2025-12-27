import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Banknote, Calendar, CreditCard, Plus, Receipt, Search, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Management', href: '/fees/categories' },
    { title: 'Payments', href: '/fees/payments' },
];

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    admission_number: string | null;
}

interface FeeCategory {
    id: number;
    name: string;
}

interface FeeStructure {
    id: number;
    fee_category: FeeCategory;
}

interface Allocation {
    id: number;
    fee_structure: FeeStructure;
}

interface User {
    id: number;
    name: string;
}

interface FeePayment {
    id: number;
    receipt_number: string;
    amount: number;
    late_fee: number;
    total_amount: number;
    payment_method: string;
    status: string;
    paid_at: string;
    student: Student;
    allocation?: Allocation;
    collector?: User;
}

interface PaginatedData {
    data: FeePayment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    payments: PaginatedData;
    stats: {
        today: number;
        month: number;
    };
    filters: {
        status?: string;
        payment_method?: string;
        search?: string;
        from_date?: string;
        to_date?: string;
    };
}

const paymentMethodLabels: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    online: 'Online',
    cheque: 'Cheque',
    mobile_banking: 'Mobile Banking',
};

export default function FeePaymentsIndex({ payments, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search });
    };

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const params = new URLSearchParams();
        const merged = { ...filters, ...newFilters };
        if (merged.search) params.set('search', merged.search);
        if (merged.status && merged.status !== 'all') params.set('status', merged.status);
        if (merged.payment_method && merged.payment_method !== 'all') params.set('payment_method', merged.payment_method);
        if (merged.from_date) params.set('from_date', merged.from_date);
        if (merged.to_date) params.set('to_date', merged.to_date);
        router.get(`/fees/payments?${params.toString()}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fee Payments" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Fee Payments
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Record and manage fee payments
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/fees/payments/create">
                            <Plus className="h-4 w-4" />
                            Record Payment
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Banknote className="h-4 w-4" />
                                Today's Collection
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">৳{Number(stats.today ?? 0).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">৳{Number(stats.month ?? 0).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4">
                            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search receipt or student..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Search</Button>
                            </form>
                            <Select
                                value={filters.payment_method ?? 'all'}
                                onValueChange={(v) => updateFilters({ payment_method: v })}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <Input
                                    type="date"
                                    value={filters.from_date ?? ''}
                                    onChange={(e) => updateFilters({ from_date: e.target.value })}
                                    className="w-[140px]"
                                />
                                <span className="text-gray-500">to</span>
                                <Input
                                    type="date"
                                    value={filters.to_date ?? ''}
                                    onChange={(e) => updateFilters({ to_date: e.target.value })}
                                    className="w-[140px]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {(payments.data?.length ?? 0) > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Receipt #</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Fee Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.data.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-mono text-sm">
                                                {payment.receipt_number}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {payment.student?.first_name} {payment.student?.last_name}
                                                    </p>
                                                    {payment.student?.admission_number && (
                                                        <p className="text-xs text-gray-500">
                                                            {payment.student.admission_number}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {payment.allocation?.fee_structure?.fee_category?.name ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div>
                                                    <p className="font-mono font-medium">
                                                        ৳{Number(payment.total_amount).toLocaleString()}
                                                    </p>
                                                    {payment.late_fee > 0 && (
                                                        <p className="text-xs text-orange-600">
                                                            +৳{Number(payment.late_fee).toLocaleString()} late
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {paymentMethodLabels[payment.payment_method] ?? payment.payment_method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(payment.paid_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/fees/payments/${payment.id}/receipt`}>
                                                        <Receipt className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <CreditCard className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    No Payments Found
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Record fee payments to see them here.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/fees/payments/create">
                                        <Plus className="h-4 w-4" />
                                        Record Payment
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {payments.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {(payments.current_page - 1) * payments.per_page + 1} to{' '}
                            {Math.min(payments.current_page * payments.per_page, payments.total)} of {payments.total}
                        </p>
                        <div className="flex gap-2">
                            {payments.current_page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/fees/payments?page=${payments.current_page - 1}`}>Previous</Link>
                                </Button>
                            )}
                            {payments.current_page < payments.last_page && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/fees/payments?page=${payments.current_page + 1}`}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
