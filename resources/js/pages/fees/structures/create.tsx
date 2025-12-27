import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ArrowLeft, Calculator, Save } from 'lucide-react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Management', href: '/fees/categories' },
    { title: 'Structures', href: '/fees/structures' },
    { title: 'Create', href: '/fees/structures/create' },
];

interface FeeCategory {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface AcademicYear {
    id: number;
    name: string;
}

interface Props {
    categories: FeeCategory[];
    classes: SchoolClass[];
    academicYears: AcademicYear[];
}

export default function CreateFeeStructure({ categories = [], classes = [], academicYears = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        fee_category_id: '',
        class_id: '',
        academic_year_id: '',
        amount: '',
        due_date: '',
        late_fee: '',
        late_fee_grace_days: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/fees/structures');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Fee Structure" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/fees/structures">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create Fee Structure
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Define fee amount for a class and academic year
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Structure Details
                            </CardTitle>
                            <CardDescription>
                                Set the fee amount and applicable class
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Fee Category <span className="text-destructive">*</span></Label>
                                <Select value={data.fee_category_id} onValueChange={(v) => setData('fee_category_id', v)}>
                                    <SelectTrigger className={errors.fee_category_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.fee_category_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Select value={data.class_id} onValueChange={(v) => setData('class_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">All Classes</SelectItem>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">Leave empty to apply to all classes</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Academic Year <span className="text-destructive">*</span></Label>
                                <Select value={data.academic_year_id} onValueChange={(v) => setData('academic_year_id', v)}>
                                    <SelectTrigger className={errors.academic_year_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((year) => (
                                            <SelectItem key={year.id} value={year.id.toString()}>{year.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.academic_year_id} />
                            </div>
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
                                    placeholder="0.00"
                                    className={errors.amount ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.amount} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="late_fee">Late Fee (৳)</Label>
                                <Input
                                    id="late_fee"
                                    type="number"
                                    step="0.01"
                                    value={data.late_fee}
                                    onChange={(e) => setData('late_fee', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="late_fee_grace_days">Grace Period (Days)</Label>
                                <Input
                                    id="late_fee_grace_days"
                                    type="number"
                                    value={data.late_fee_grace_days}
                                    onChange={(e) => setData('late_fee_grace_days', e.target.value)}
                                    placeholder="0"
                                />
                                <p className="text-xs text-gray-500">Days after due date before late fee applies</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/fees/structures">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Structure'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
