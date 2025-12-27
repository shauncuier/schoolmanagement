import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertTriangle,
    Banknote,
    Calendar,
    CreditCard,
    Receipt,
    TrendingUp,
    Users
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Management', href: '/fees/categories' },
    { title: 'Reports', href: '/fees/reports' },
];

interface PaymentMethod {
    payment_method: string;
    count: number;
    total: number;
}

interface DailyCollection {
    date: string;
    total: number;
}

interface ClassCollection {
    class_name: string;
    count: number;
    total: number;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    admission_number: string | null;
    section?: {
        name: string;
        school_class?: {
            name: string;
        };
    };
}

interface Defaulter {
    student_id: number;
    total_due: number;
    student: Student;
}

interface Props {
    stats: {
        totalCollected: number;
        totalTransactions: number;
        avgTransaction: number;
        totalOutstanding: number;
        overdueCount: number;
    };
    byMethod: PaymentMethod[];
    dailyCollection: DailyCollection[];
    byClass: ClassCollection[];
    defaulters: Defaulter[];
    filters: {
        from_date: string;
        to_date: string;
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

export default function FeeReports({ stats, byMethod = [], dailyCollection = [], byClass = [], defaulters = [], filters }: Props) {
    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const params = new URLSearchParams();
        const merged = { ...filters, ...newFilters };
        if (merged.from_date) params.set('from_date', merged.from_date);
        if (merged.to_date) params.set('to_date', merged.to_date);
        router.get(`/fees/reports?${params.toString()}`);
    };

    // Calculate max for bar chart scaling
    const maxDaily = Math.max(...dailyCollection.map(d => Number(d.total)), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fee Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Fee Reports
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Collection statistics and financial overview
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <Input
                            type="date"
                            value={filters.from_date}
                            onChange={(e) => updateFilters({ from_date: e.target.value })}
                            className="w-[140px]"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                            type="date"
                            value={filters.to_date}
                            onChange={(e) => updateFilters({ to_date: e.target.value })}
                            className="w-[140px]"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Banknote className="h-4 w-4" />
                                Total Collected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">৳{Number(stats.totalCollected ?? 0).toLocaleString()}</p>
                            <p className="text-xs text-white/70 mt-1">
                                {stats.totalTransactions} transactions
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Avg. Transaction
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">৳{Number(stats.avgTransaction ?? 0).toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                Outstanding
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">৳{Number(stats.totalOutstanding ?? 0).toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-600 to-rose-700 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Overdue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.overdueCount ?? 0}</p>
                            <p className="text-xs text-white/70 mt-1">students with overdue fees</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Collection Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Daily Collection</CardTitle>
                            <CardDescription>Collection trend for selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dailyCollection.length > 0 ? (
                                <div className="space-y-3">
                                    {dailyCollection.slice(-10).map((day) => (
                                        <div key={day.date} className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500 w-20">
                                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                                    style={{ width: `${(Number(day.total) / maxDaily) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-mono font-medium w-24 text-right">
                                                ৳{Number(day.total).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">No collection data for this period</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                By Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {byMethod.length > 0 ? (
                                <div className="space-y-4">
                                    {byMethod.map((method) => (
                                        <div key={method.payment_method} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">
                                                    {paymentMethodLabels[method.payment_method] ?? method.payment_method}
                                                </Badge>
                                                <span className="text-sm text-gray-500">
                                                    {method.count} payments
                                                </span>
                                            </div>
                                            <span className="font-mono font-bold">
                                                ৳{Number(method.total).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">No payments in this period</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Collection by Class */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Collection by Class
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {byClass.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Class</TableHead>
                                            <TableHead className="text-right">Payments</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {byClass.map((item) => (
                                            <TableRow key={item.class_name}>
                                                <TableCell className="font-medium">{item.class_name}</TableCell>
                                                <TableCell className="text-right">{item.count}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ৳{Number(item.total).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center text-gray-500 py-8">No class-wise data available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Defaulters */}
                    <Card className="border-red-200 dark:border-red-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Top Defaulters
                            </CardTitle>
                            <CardDescription>Students with highest overdue amounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {defaulters.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead className="text-right">Due Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {defaulters.map((item) => (
                                            <TableRow key={item.student_id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {item.student?.first_name} {item.student?.last_name}
                                                        </p>
                                                        {item.student?.admission_number && (
                                                            <p className="text-xs text-gray-500">
                                                                {item.student.admission_number}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.student?.section?.school_class?.name ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-red-600 font-bold">
                                                    ৳{Number(item.total_due).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center text-green-600 py-8">No overdue fees! 🎉</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
