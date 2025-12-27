import AppLayout from '@/layouts/app-layout';
import { type AcademicYear, type BreadcrumbItem, type SchoolClass } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, GraduationCap, Save } from 'lucide-react';
import InputError from '@/components/input-error';

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Student {
    id: number;
    admission_no: string;
    admission_date: string;
    class_id: number;
    section_id: number;
    academic_year_id: number;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string | null;
    religion: string | null;
    nationality: string | null;
    present_address: string | null;
    permanent_address: string | null;
    status: string;
    user: { id: number; name: string; email: string };
}

interface Props {
    student: Student;
    classes: SchoolClass[];
    sections: Section[];
    academicYears: AcademicYear[];
}

export default function EditStudent({ student, classes = [], sections = [], academicYears = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Students', href: '/students' },
        { title: student.user?.name ?? 'Edit', href: `/students/${student.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: student.user?.name ?? '',
        email: student.user?.email ?? '',
        admission_no: student.admission_no ?? '',
        admission_date: student.admission_date ?? '',
        class_id: student.class_id?.toString() ?? '',
        section_id: student.section_id?.toString() ?? '',
        academic_year_id: student.academic_year_id?.toString() ?? '',
        date_of_birth: student.date_of_birth ?? '',
        gender: student.gender ?? '',
        blood_group: student.blood_group ?? '',
        religion: student.religion ?? '',
        nationality: student.nationality ?? '',
        present_address: student.present_address ?? '',
        permanent_address: student.permanent_address ?? '',
        status: student.status ?? 'active',
    });

    // Filter sections based on selected class
    const filteredSections = (sections ?? []).filter(
        (s) => s.class_id.toString() === data.class_id
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/students/${student.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${student.user?.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/students/${student.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Student
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update details for {student.user?.name}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Student name and contact details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admission_no">
                                    Admission No <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="admission_no"
                                    value={data.admission_no}
                                    onChange={(e) => setData('admission_no', e.target.value)}
                                    className={errors.admission_no ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.admission_no} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admission_date">
                                    Admission Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="admission_date"
                                    type="date"
                                    value={data.admission_date}
                                    onChange={(e) => setData('admission_date', e.target.value)}
                                    className={errors.admission_date ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.admission_date} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Class <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.class_id}
                                    onValueChange={(v) => {
                                        setData('class_id', v);
                                        setData('section_id', '');
                                    }}
                                >
                                    <SelectTrigger className={errors.class_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(classes ?? []).map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.class_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Section <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.section_id}
                                    onValueChange={(v) => setData('section_id', v)}
                                    disabled={!data.class_id}
                                >
                                    <SelectTrigger className={errors.section_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSections.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.section_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Academic Year <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.academic_year_id}
                                    onValueChange={(v) => setData('academic_year_id', v)}
                                >
                                    <SelectTrigger className={errors.academic_year_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(academicYears ?? []).map((y) => (
                                            <SelectItem key={y.id} value={y.id.toString()}>
                                                {y.name} {y.is_current && '(Current)'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.academic_year_id} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Blood Group</Label>
                                <Select value={data.blood_group} onValueChange={(v) => setData('blood_group', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="graduated">Graduated</SelectItem>
                                        <SelectItem value="transferred">Transferred</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Address</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Present Address</Label>
                                <Input
                                    value={data.present_address}
                                    onChange={(e) => setData('present_address', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Permanent Address</Label>
                                <Input
                                    value={data.permanent_address}
                                    onChange={(e) => setData('permanent_address', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={`/students/${student.id}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
