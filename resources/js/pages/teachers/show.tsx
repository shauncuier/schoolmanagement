import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
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
    ArrowLeft,
    Briefcase,
    Calendar,
    Edit,
    GraduationCap,
    Mail,
    User,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Section {
    id: number;
    name: string;
    school_class?: { id: number; name: string };
}

interface Teacher {
    id: number;
    employee_id: string | null;
    designation: string | null;
    department: string | null;
    joining_date: string | null;
    qualification: string | null;
    specialization: string | null;
    salary: number | null;
    employment_type: string;
    is_active: boolean;
    user: User;
    classes_taught?: Section[];
}

interface Props {
    teacher: Teacher;
}

const employmentTypeColors: Record<string, string> = {
    'full-time': 'bg-emerald-100 text-emerald-700',
    'part-time': 'bg-blue-100 text-blue-700',
    'contract': 'bg-amber-100 text-amber-700',
    'substitute': 'bg-purple-100 text-purple-700',
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) => (
    <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-medium text-gray-900 dark:text-white">{value || '-'}</p>
        </div>
    </div>
);

export default function ShowTeacher({ teacher }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Teachers', href: '/teachers' },
        { title: teacher.user?.name ?? 'Teacher', href: `/teachers/${teacher.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={teacher.user?.name ?? 'Teacher Profile'} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/teachers">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-2xl font-bold text-white">
                                {teacher.user?.name?.charAt(0) ?? 'T'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {teacher.user?.name}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{teacher.designation ?? 'Teacher'}</span>
                                    <Badge className={employmentTypeColors[teacher.employment_type] ?? ''}>
                                        {teacher.employment_type}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/teachers/${teacher.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Edit Teacher
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <InfoItem icon={Mail} label="Email" value={teacher.user?.email} />
                                <InfoItem icon={User} label="Employee ID" value={teacher.employee_id} />
                                <InfoItem icon={Calendar} label="Joining Date" value={teacher.joining_date} />
                            </CardContent>
                        </Card>

                        {/* Professional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Professional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <InfoItem icon={Briefcase} label="Department" value={teacher.department} />
                                <InfoItem icon={Briefcase} label="Designation" value={teacher.designation} />
                                <InfoItem icon={Briefcase} label="Employment Type" value={teacher.employment_type} />
                            </CardContent>
                        </Card>

                        {/* Qualifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Qualifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <InfoItem icon={GraduationCap} label="Qualification" value={teacher.qualification} />
                                <InfoItem icon={GraduationCap} label="Specialization" value={teacher.specialization} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Status</span>
                                    <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                                        {teacher.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Type</span>
                                    <Badge className={employmentTypeColors[teacher.employment_type] ?? ''}>
                                        {teacher.employment_type}
                                    </Badge>
                                </div>
                                {teacher.department && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Department</span>
                                        <span className="font-medium">{teacher.department}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Classes Taught */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Classes Assigned</CardTitle>
                                <CardDescription>
                                    Sections as class teacher
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(teacher.classes_taught?.length ?? 0) > 0 ? (
                                    <div className="space-y-2">
                                        {teacher.classes_taught?.map((section) => (
                                            <div key={section.id} className="rounded-lg border p-3">
                                                <p className="font-medium">
                                                    {section.school_class?.name} - Section {section.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No classes assigned as class teacher</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
