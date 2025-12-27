import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
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
import { ArrowLeft, Calendar, Save, User } from 'lucide-react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave Requests', href: '/leave-requests' },
    { title: 'New Request', href: '/leave-requests/create' },
];

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    admission_number: string | null;
}

interface Staff {
    id: number;
    name: string;
    email: string;
}

interface Props {
    students: Student[];
    staff: Staff[];
    leaveTypes: Record<string, string>;
}

export default function CreateLeaveRequest({ students = [], staff = [], leaveTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        requester_type: 'student',
        requester_id: '',
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/leave-requests');
    };

    // Calculate total days
    const totalDays = data.start_date && data.end_date
        ? Math.max(1, Math.ceil((new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Leave Request" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/leave-requests">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            New Leave Request
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Submit a leave request for a student or staff member
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requester Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Requester
                            </CardTitle>
                            <CardDescription>
                                Select who is requesting the leave
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Requester Type <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.requester_type}
                                    onValueChange={(v) => {
                                        setData('requester_type', v);
                                        setData('requester_id', '');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    {data.requester_type === 'student' ? 'Student' : 'Staff Member'}
                                    <span className="text-destructive"> *</span>
                                </Label>
                                <Select
                                    value={data.requester_id}
                                    onValueChange={(v) => setData('requester_id', v)}
                                >
                                    <SelectTrigger className={errors.requester_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={`Select ${data.requester_type}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.requester_type === 'student' ? (
                                            students.map((student) => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    {student.first_name} {student.last_name}
                                                    {student.admission_number && ` (${student.admission_number})`}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            staff.map((member) => (
                                                <SelectItem key={member.id} value={member.id.toString()}>
                                                    {member.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.requester_id} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Leave Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Leave Type <span className="text-destructive">*</span></Label>
                                <Select value={data.leave_type} onValueChange={(v) => setData('leave_type', v)}>
                                    <SelectTrigger className={errors.leave_type ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(leaveTypes).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.leave_type} />
                            </div>
                            <div className="flex items-end">
                                {totalDays > 0 && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-full text-center">
                                        <p className="text-2xl font-bold text-blue-600">{totalDays}</p>
                                        <p className="text-xs text-gray-500">day{totalDays > 1 ? 's' : ''}</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date <span className="text-destructive">*</span></Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className={errors.start_date ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.start_date} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date <span className="text-destructive">*</span></Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    min={data.start_date}
                                    className={errors.end_date ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.end_date} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="reason">Reason <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    rows={4}
                                    placeholder="Explain the reason for this leave request..."
                                    className={errors.reason ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.reason} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/leave-requests">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
