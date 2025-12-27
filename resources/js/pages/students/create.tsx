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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Students', href: '/students' },
    { title: 'Create', href: '/students/create' },
];

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Props {
    classes: SchoolClass[];
    sections: Section[];
    academicYears: AcademicYear[];
}

interface FormData {
    name: string;
    email: string;
    admission_no: string;
    admission_date: string;
    class_id: string;
    section_id: string;
    academic_year_id: string;
    date_of_birth: string;
    gender: string;
    blood_group: string;
    religion: string;
    nationality: string;
    present_address: string;
    permanent_address: string;
    status: string;
}

export default function CreateStudent({ classes = [], sections = [], academicYears = [] }: Props) {
    const currentYear = academicYears?.find((y) => y.is_current);

    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        email: '',
        admission_no: '',
        admission_date: new Date().toISOString().split('T')[0],
        class_id: '',
        section_id: '',
        academic_year_id: currentYear?.id?.toString() ?? '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        religion: '',
        nationality: '',
        present_address: '',
        permanent_address: '',
        status: 'active',
    });

    // Filter sections based on selected class
    const filteredSections = (sections ?? []).filter(
        (s) => s.class_id.toString() === data.class_id
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/students');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Student" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/students">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create Student
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add a new student to the school
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
                                    placeholder="Enter student's full name"
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
                                    placeholder="student@example.com"
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
                                    placeholder="e.g., STU-2024-001"
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
                            <CardDescription>
                                Class, section, and academic year
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>
                                    Class <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.class_id}
                                    onValueChange={(v) => {
                                        setData('class_id', v);
                                        setData('section_id', ''); // Reset section when class changes
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
                                <Label>
                                    Section <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.section_id}
                                    onValueChange={(v) => setData('section_id', v)}
                                    disabled={!data.class_id}
                                >
                                    <SelectTrigger className={errors.section_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={data.class_id ? 'Select section' : 'Select class first'} />
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
                                <Label>
                                    Academic Year <span className="text-destructive">*</span>
                                </Label>
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
                            <CardDescription>
                                Date of birth, gender, and other personal information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="blood_group">Blood Group</Label>
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
                                <Label htmlFor="present_address">Present Address</Label>
                                <Input
                                    id="present_address"
                                    value={data.present_address}
                                    onChange={(e) => setData('present_address', e.target.value)}
                                    placeholder="Current residential address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="permanent_address">Permanent Address</Label>
                                <Input
                                    id="permanent_address"
                                    value={data.permanent_address}
                                    onChange={(e) => setData('permanent_address', e.target.value)}
                                    placeholder="Permanent address"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/students">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Student'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
