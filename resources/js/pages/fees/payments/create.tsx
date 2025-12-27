import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
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
import { ArrowLeft, Banknote, Save, User } from 'lucide-react';
import InputError from '@/components/input-error';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Management', href: '/fees/categories' },
    { title: 'Payments', href: '/fees/payments' },
    { title: 'Record', href: '/fees/payments/create' },
];

interface Section {
    id: number;
    name: string;
    school_class?: {
        id: number;
        name: string;
    };
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    admission_number: string | null;
    section?: Section;
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
    net_amount: number;
    due_amount: number;
    paid_amount: number;
    due_date: string | null;
    status: string;
    fee_structure: FeeStructure;
}

interface Props {
    students: Student[];
}

export default function CreateFeePayment({ students = [] }: Props) {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [loadingFees, setLoadingFees] = useState(false);
    const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        allocation_id: '',
        amount: '',
        payment_method: 'cash',
        transaction_id: '',
        bank_name: '',
        cheque_number: '',
        cheque_date: '',
        remarks: '',
    });

    useEffect(() => {
        if (data.student_id) {
            setLoadingFees(true);
            fetch(`/fees/students/${data.student_id}/fees`)
                .then(res => res.json())
                .then(result => {
                    setAllocations(result.allocations || []);
                    setLoadingFees(false);
                })
                .catch(() => setLoadingFees(false));
        } else {
            setAllocations([]);
        }
    }, [data.student_id]);

    useEffect(() => {
        if (data.allocation_id) {
            const alloc = allocations.find(a => a.id.toString() === data.allocation_id);
            setSelectedAllocation(alloc || null);
            if (alloc) {
                setData('amount', alloc.due_amount.toString());
            }
        } else {
            setSelectedAllocation(null);
        }
    }, [data.allocation_id, allocations]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/fees/payments');
    };

    const showChequeFields = data.payment_method === 'cheque';
    const showBankFields = ['bank_transfer', 'cheque'].includes(data.payment_method);
    const showTransactionId = ['card', 'online', 'mobile_banking'].includes(data.payment_method);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Fee Payment" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/fees/payments">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Record Fee Payment
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Collect fee payment from a student
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Student Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Select Student
                            </CardTitle>
                            <CardDescription>
                                Choose a student with pending fees
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Student <span className="text-destructive">*</span></Label>
                                <Select value={data.student_id} onValueChange={(v) => setData('student_id', v)}>
                                    <SelectTrigger className={errors.student_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                {student.first_name} {student.last_name}
                                                {student.section?.school_class?.name && ` - ${student.section.school_class.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.student_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Pending Fee <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.allocation_id}
                                    onValueChange={(v) => setData('allocation_id', v)}
                                    disabled={!data.student_id || loadingFees}
                                >
                                    <SelectTrigger className={errors.allocation_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={loadingFees ? 'Loading...' : 'Select fee'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allocations.map((alloc) => (
                                            <SelectItem key={alloc.id} value={alloc.id.toString()}>
                                                {alloc.fee_structure?.fee_category?.name} - ৳{Number(alloc.due_amount).toLocaleString()} due
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.allocation_id} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fee Summary */}
                    {selectedAllocation && (
                        <Card className="border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4">
                                <div className="grid gap-4 sm:grid-cols-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="text-lg font-bold">৳{Number(selectedAllocation.net_amount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Already Paid</p>
                                        <p className="text-lg font-bold text-green-600">৳{Number(selectedAllocation.paid_amount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Due Amount</p>
                                        <p className="text-lg font-bold text-red-600">৳{Number(selectedAllocation.due_amount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Due Date</p>
                                        <p className="text-lg font-bold">
                                            {selectedAllocation.due_date ? new Date(selectedAllocation.due_date).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Banknote className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">
                                    Amount (৳) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className={errors.amount ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.amount} />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Method <span className="text-destructive">*</span></Label>
                                <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {showTransactionId && (
                                <div className="space-y-2">
                                    <Label htmlFor="transaction_id">Transaction ID</Label>
                                    <Input
                                        id="transaction_id"
                                        value={data.transaction_id}
                                        onChange={(e) => setData('transaction_id', e.target.value)}
                                    />
                                </div>
                            )}
                            {showBankFields && (
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Bank Name</Label>
                                    <Input
                                        id="bank_name"
                                        value={data.bank_name}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                    />
                                </div>
                            )}
                            {showChequeFields && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="cheque_number">Cheque Number</Label>
                                        <Input
                                            id="cheque_number"
                                            value={data.cheque_number}
                                            onChange={(e) => setData('cheque_number', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cheque_date">Cheque Date</Label>
                                        <Input
                                            id="cheque_date"
                                            type="date"
                                            value={data.cheque_date}
                                            onChange={(e) => setData('cheque_date', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    rows={2}
                                    placeholder="Optional notes"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/fees/payments">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing || !data.allocation_id}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Processing...' : 'Record Payment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
