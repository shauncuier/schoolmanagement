import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    FileText,
    Mail,
    Phone,
    UserCheck,
    Building2,
    Info,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdmissionApplication {
    id: number;
    application_no: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    blood_group?: string;
    religion?: string;
    nationality: string;
    status: 'pending' | 'under_review' | 'interview_scheduled' | 'approved' | 'rejected';
    guardian_name: string;
    guardian_phone: string;
    guardian_email?: string;
    guardian_relation: string;
    guardian_occupation?: string;
    address?: string;
    previous_school?: string;
    previous_class?: string;
    previous_marks_percentage?: number;
    interview_date?: string;
    admin_remarks?: string;
    processed_by?: number;
    school_class?: { name: string };
    academic_year?: { name: string };
    processor?: { name: string };
    created_at: string;
}

interface Props {
    application: AdmissionApplication;
}

const breadcrumbs = (application: AdmissionApplication): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admissions', href: '/admissions' },
    { title: application.application_no, href: `/admissions/${application.id}` },
];

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    under_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    interview_scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdmissionShow({ application }: Props) {
    const { data, setData, post, processing } = useForm({
        status: application.status,
        admin_remarks: application.admin_remarks || '',
        interview_date: application.interview_date || '',
    });

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admissions/${application.id}/status`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(application)}>
            <Head title={`Application: ${application.application_no}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" asChild className="-ml-2">
                        <Link href="/admissions">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Applications
                        </Link>
                    </Button>
                    <Badge className={statusColors[application.status]}>
                        {application.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">
                                            {application.first_name} {application.last_name}
                                        </CardTitle>
                                        <CardDescription>
                                            Application No: {application.application_no} | Applied on {new Date(application.created_at).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Info className="h-4 w-4 text-gray-400" />
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                                        <span className="text-gray-500">Gender</span>
                                        <span className="font-medium capitalize">{application.gender}</span>
                                        <span className="text-gray-500">Date of Birth</span>
                                        <span className="font-medium">{new Date(application.date_of_birth).toLocaleDateString()}</span>
                                        <span className="text-gray-500">Blood Group</span>
                                        <span className="font-medium">{application.blood_group || 'N/A'}</span>
                                        <span className="text-gray-500">Nationality</span>
                                        <span className="font-medium">{application.nationality}</span>
                                        <span className="text-gray-500">Religion</span>
                                        <span className="font-medium">{application.religion || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        Academic Choice
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                                        <span className="text-gray-500">Class</span>
                                        <span className="font-medium">{application.school_class?.name}</span>
                                        <span className="text-gray-500">Academic Year</span>
                                        <span className="font-medium">{application.academic_year?.name}</span>
                                        <span className="text-gray-500">Prev. School</span>
                                        <span className="font-medium">{application.previous_school || 'N/A'}</span>
                                        <span className="text-gray-500">Prev. Class</span>
                                        <span className="font-medium">{application.previous_class || 'N/A'}</span>
                                        <span className="text-gray-500">Academic %</span>
                                        <span className="font-medium text-indigo-600">{application.previous_marks_percentage ? `${application.previous_marks_percentage}%` : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 sm:col-span-2 pt-4 border-t dark:border-gray-800">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        Guardian Information
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Name</p>
                                            <p className="font-medium">{application.guardian_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Relation</p>
                                            <p className="font-medium capitalize">{application.guardian_relation}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Phone</p>
                                            <p className="font-medium">{application.guardian_phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Email</p>
                                            <p className="font-medium">{application.guardian_email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Workflow History / Remarks */}
                        {application.admin_remarks && (
                            <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                                <CardHeader className="py-4">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-400">
                                        <AlertCircle className="h-4 w-4" />
                                        Admin Remarks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-amber-900 dark:text-amber-300 italic">
                                        "{application.admin_remarks}"
                                    </p>
                                    <p className="text-[10px] mt-2 text-amber-600 dark:text-amber-500 uppercase font-medium">
                                        Processed by: {application.processor?.name || 'System'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Processing Panel */}
                    <div className="space-y-6">
                        <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-lg shadow-indigo-500/5">
                            <CardHeader>
                                <CardTitle className="text-lg">Process Application</CardTitle>
                                <CardDescription>Update status or finalize admission</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitStatus} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(v) => setData('status', v as 'pending' | 'under_review' | 'interview_scheduled' | 'approved' | 'rejected')}
                                            disabled={application.status === 'approved'}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="under_review">Under Review</SelectItem>
                                                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                                                <SelectItem value="approved">Approved (Final)</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {data.status === 'interview_scheduled' && (
                                        <div className="space-y-2">
                                            <Label>Interview Date</Label>
                                            <Input
                                                type="date"
                                                value={data.interview_date}
                                                onChange={(e) => setData('interview_date', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Admin Remarks</Label>
                                        <Textarea
                                            placeholder="Internal notes..."
                                            value={data.admin_remarks}
                                            onChange={(e) => setData('admin_remarks', e.target.value)}
                                            rows={4}
                                        />
                                    </div>

                                    <Button
                                        className="w-full"
                                        disabled={processing || application.status === 'approved'}
                                        variant={data.status === 'approved' ? 'default' : 'secondary'}
                                    >
                                        {data.status === 'approved' ? (
                                            <>
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Approve & Admit Student
                                            </>
                                        ) : (
                                            'Update Workflow'
                                        )}
                                    </Button>

                                    {application.status === 'approved' && (
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-400">Application Approved</p>
                                                <p className="text-xs text-emerald-700 dark:text-emerald-500">This student has been successfully admitted to the school system.</p>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm">Action History</CardTitle>
                            </CardHeader>
                            <CardContent className="px-3">
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold">Welcome Email Sent</p>
                                            <p className="text-[10px] text-gray-500">{new Date(application.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold">Application Received</p>
                                            <p className="text-[10px] text-gray-500">{new Date(application.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
