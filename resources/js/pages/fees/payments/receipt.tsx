import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';

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
    transaction_id: string | null;
    bank_name: string | null;
    cheque_number: string | null;
    cheque_date: string | null;
    status: string;
    remarks: string | null;
    paid_at: string;
    student: Student;
    allocation?: Allocation;
    collector?: User;
}

interface Props {
    payment: FeePayment;
}

const paymentMethodLabels: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    online: 'Online',
    cheque: 'Cheque',
    mobile_banking: 'Mobile Banking',
};

export default function FeePaymentReceipt({ payment }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Fee Management', href: '/fees/categories' },
        { title: 'Payments', href: '/fees/payments' },
        { title: payment.receipt_number, href: `/fees/payments/${payment.id}/receipt` },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Receipt ${payment.receipt_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/fees/payments">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Payment Receipt
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {payment.receipt_number}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>

                {/* Receipt */}
                <Card className="max-w-2xl mx-auto print:shadow-none print:border-0">
                    <CardContent className="p-8">
                        {/* Header */}
                        <div className="text-center border-b pb-6 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Fee Payment Receipt
                            </h2>
                            <p className="text-gray-500 mt-1">Thank you for your payment</p>
                        </div>

                        {/* Receipt Details */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Receipt Number</p>
                                <p className="font-mono font-bold text-lg">{payment.receipt_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Payment Date</p>
                                <p className="font-medium">{new Date(payment.paid_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <hr className="my-6" />

                        {/* Student Info */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Student Details</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">
                                        {payment.student?.first_name} {payment.student?.last_name}
                                    </p>
                                </div>
                                {payment.student?.admission_number && (
                                    <div>
                                        <p className="text-sm text-gray-500">Admission No</p>
                                        <p className="font-medium">{payment.student.admission_number}</p>
                                    </div>
                                )}
                                {payment.student?.section?.school_class && (
                                    <div>
                                        <p className="text-sm text-gray-500">Class</p>
                                        <p className="font-medium">
                                            {payment.student.section.school_class.name} - {payment.student.section.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr className="my-6" />

                        {/* Payment Details */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Details</h3>
                            <table className="w-full">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2 text-gray-600">Fee Type</td>
                                        <td className="py-2 text-right font-medium">
                                            {payment.allocation?.fee_structure?.fee_category?.name ?? 'General Fee'}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 text-gray-600">Amount Paid</td>
                                        <td className="py-2 text-right font-medium">৳{Number(payment.amount).toLocaleString()}</td>
                                    </tr>
                                    {payment.late_fee > 0 && (
                                        <tr className="border-b">
                                            <td className="py-2 text-gray-600">Late Fee</td>
                                            <td className="py-2 text-right font-medium text-orange-600">
                                                ৳{Number(payment.late_fee).toLocaleString()}
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="py-3 text-lg font-bold">Total</td>
                                        <td className="py-3 text-right text-xl font-bold text-green-600">
                                            ৳{Number(payment.total_amount).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Method */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">Payment Method</p>
                                <p className="font-medium">
                                    {paymentMethodLabels[payment.payment_method] ?? payment.payment_method}
                                </p>
                            </div>
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="text-sm">
                                {payment.status.toUpperCase()}
                            </Badge>
                        </div>

                        {/* Additional Info */}
                        {(payment.transaction_id || payment.cheque_number || payment.bank_name) && (
                            <div className="mt-4 p-4 border rounded-lg">
                                {payment.transaction_id && (
                                    <p className="text-sm"><span className="text-gray-500">Transaction ID:</span> {payment.transaction_id}</p>
                                )}
                                {payment.bank_name && (
                                    <p className="text-sm"><span className="text-gray-500">Bank:</span> {payment.bank_name}</p>
                                )}
                                {payment.cheque_number && (
                                    <p className="text-sm"><span className="text-gray-500">Cheque No:</span> {payment.cheque_number}</p>
                                )}
                            </div>
                        )}

                        {payment.remarks && (
                            <div className="mt-4 p-4 border rounded-lg">
                                <p className="text-sm text-gray-500">Remarks</p>
                                <p className="text-sm">{payment.remarks}</p>
                            </div>
                        )}

                        {/* Collector */}
                        {payment.collector && (
                            <div className="mt-6 text-center text-sm text-gray-500">
                                <p>Collected by: {payment.collector.name}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
                            <p>This is a computer-generated receipt and does not require a signature.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
