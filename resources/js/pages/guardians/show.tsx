import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Briefcase, Edit, GraduationCap, Mail, Phone, User } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

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

interface Guardian {
    id: number;
    occupation: string | null;
    workplace: string | null;
    annual_income: number | null;
    relation_type: string;
    is_primary_contact: boolean;
    is_active: boolean;
    user: User;
    students: Student[];
}

interface Props {
    guardian: Guardian;
}

const relationTypeLabels: Record<string, string> = {
    father: 'Father',
    mother: 'Mother',
    guardian: 'Guardian',
    uncle: 'Uncle',
    aunt: 'Aunt',
    grandparent: 'Grandparent',
    other: 'Other',
};

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-medium">{value ?? '-'}</p>
            </div>
        </div>
    );
}

export default function ShowGuardian({ guardian }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Parents', href: '/guardians' },
        { title: guardian.user?.name ?? 'Parent', href: `/guardians/${guardian.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={guardian.user?.name ?? 'Parent Profile'} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/guardians">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                                {guardian.user?.name?.charAt(0) ?? 'P'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {guardian.user?.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline">
                                        {relationTypeLabels[guardian.relation_type] ?? guardian.relation_type}
                                    </Badge>
                                    {guardian.is_primary_contact && (
                                        <Badge variant="default">Primary Contact</Badge>
                                    )}
                                    <Badge variant={guardian.is_active ? 'default' : 'secondary'}>
                                        {guardian.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/guardians/${guardian.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <InfoItem icon={Mail} label="Email" value={guardian.user?.email} />
                                <InfoItem icon={Phone} label="Phone" value={guardian.user?.phone} />
                            </CardContent>
                        </Card>

                        {/* Work Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <InfoItem icon={Briefcase} label="Occupation" value={guardian.occupation} />
                                <InfoItem icon={Briefcase} label="Workplace" value={guardian.workplace} />
                                <InfoItem
                                    icon={Briefcase}
                                    label="Annual Income"
                                    value={guardian.annual_income ? `৳${Number(guardian.annual_income).toLocaleString()}` : null}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Children */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Children ({guardian.students?.length ?? 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(guardian.students?.length ?? 0) > 0 ? (
                                    <div className="space-y-3">
                                        {guardian.students.map((student) => (
                                            <Link
                                                key={student.id}
                                                href={`/students/${student.id}`}
                                                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
                                                    {student.first_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {student.first_name} {student.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {student.section?.school_class?.name ?? 'No class'}
                                                        {student.section?.name && ` - ${student.section.name}`}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No children linked to this parent.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
