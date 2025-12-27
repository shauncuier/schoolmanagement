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
    Calendar,
    Edit,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    User,
    Users,
} from 'lucide-react';

interface Guardian {
    id: number;
    user: { name: string; email: string };
    phone: string | null;
    occupation: string | null;
    pivot: { relationship: string; is_emergency_contact: boolean };
}

interface Student {
    id: number;
    admission_no: string;
    roll_number: string | null;
    status: string;
    admission_date: string;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string | null;
    religion: string | null;
    nationality: string | null;
    present_address: string | null;
    permanent_address: string | null;
    user: { id: number; name: string; email: string };
    school_class: { id: number; name: string } | null;
    section: { id: number; name: string } | null;
    academic_year: { id: number; name: string } | null;
    guardians: Guardian[];
}

interface Props {
    student: Student;
}

const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    graduated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    transferred: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function ShowStudent({ student }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Students', href: '/students' },
        { title: student.user?.name ?? 'Student', href: `/students/${student.id}` },
    ];

    const InfoItem = ({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string | null }) => (
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={student.user?.name ?? 'Student Profile'} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/students">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                                {student.user?.name?.charAt(0) ?? 'S'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {student.user?.name}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>Admission: {student.admission_no}</span>
                                    <Badge className={statusColors[student.status] ?? ''}>
                                        {student.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/students/${student.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Edit Student
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <InfoItem icon={Mail} label="Email" value={student.user?.email} />
                                <InfoItem icon={Calendar} label="Date of Birth" value={student.date_of_birth} />
                                <InfoItem icon={User} label="Gender" value={student.gender} />
                                <InfoItem icon={User} label="Blood Group" value={student.blood_group} />
                                <InfoItem icon={User} label="Religion" value={student.religion} />
                                <InfoItem icon={User} label="Nationality" value={student.nationality} />
                            </CardContent>
                        </Card>

                        {/* Academic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Academic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <InfoItem icon={GraduationCap} label="Class" value={student.school_class?.name ?? null} />
                                <InfoItem icon={GraduationCap} label="Section" value={student.section?.name ?? null} />
                                <InfoItem icon={Calendar} label="Academic Year" value={student.academic_year?.name ?? null} />
                                <InfoItem icon={Calendar} label="Admission Date" value={student.admission_date} />
                                <InfoItem icon={User} label="Roll Number" value={student.roll_number} />
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <InfoItem icon={MapPin} label="Present Address" value={student.present_address} />
                                <InfoItem icon={MapPin} label="Permanent Address" value={student.permanent_address} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Guardians */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Guardians
                                </CardTitle>
                                <CardDescription>
                                    Parent/Guardian information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(student.guardians?.length ?? 0) > 0 ? (
                                    <div className="space-y-4">
                                        {student.guardians.map((guardian) => (
                                            <div key={guardian.id} className="rounded-lg border p-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">{guardian.user?.name}</p>
                                                    {guardian.pivot?.is_emergency_contact && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Emergency
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{guardian.pivot?.relationship}</p>
                                                {guardian.phone && (
                                                    <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                                                        <Phone className="h-3 w-3" />
                                                        {guardian.phone}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No guardians assigned</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Status</span>
                                    <Badge className={statusColors[student.status] ?? ''}>
                                        {student.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Class</span>
                                    <span className="font-medium">
                                        {student.school_class?.name ?? '-'}
                                        {student.section && ` - ${student.section.name}`}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
