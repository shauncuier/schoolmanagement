import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Card,
    CardContent,
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
import { ArrowLeft, Save, Shield, UserCheck } from 'lucide-react';
import InputError from '@/components/input-error';

interface User {
    id: number;
    name: string;
    email: string;
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
}

interface Props {
    teacher: Teacher;
    currentRole?: string;
}

export default function EditTeacher({ teacher, currentRole = 'teacher' }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Teachers', href: '/teachers' },
        { title: teacher.user?.name ?? 'Edit', href: `/teachers/${teacher.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: teacher.user?.name ?? '',
        email: teacher.user?.email ?? '',
        role: currentRole,
        employee_id: teacher.employee_id ?? '',
        designation: teacher.designation ?? '',
        department: teacher.department ?? '',
        joining_date: teacher.joining_date ?? '',
        qualification: teacher.qualification ?? '',
        specialization: teacher.specialization ?? '',
        salary: teacher.salary?.toString() ?? '',
        employment_type: teacher.employment_type ?? 'full-time',
        is_active: teacher.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/teachers/${teacher.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${teacher.user?.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/teachers/${teacher.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Teacher
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update details for {teacher.user?.name}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
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
                                <Label htmlFor="employee_id">Employee ID</Label>
                                <Input
                                    id="employee_id"
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="joining_date">Joining Date</Label>
                                <Input
                                    id="joining_date"
                                    type="date"
                                    value={data.joining_date}
                                    onChange={(e) => setData('joining_date', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input
                                    id="designation"
                                    value={data.designation}
                                    onChange={(e) => setData('designation', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Employment Type <span className="text-destructive">*</span></Label>
                                <Select value={data.employment_type} onValueChange={(v) => setData('employment_type', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full Time</SelectItem>
                                        <SelectItem value="part-time">Part Time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="substitute">Substitute</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary">Salary</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    value={data.salary}
                                    onChange={(e) => setData('salary', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Qualifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Qualifications</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="qualification">Qualification</Label>
                                <Input
                                    id="qualification"
                                    value={data.qualification}
                                    onChange={(e) => setData('qualification', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    value={data.specialization}
                                    onChange={(e) => setData('specialization', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status & Role */}
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Active Status</Label>
                                    <p className="text-sm text-gray-500">Set whether this teacher is currently active</p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(v: boolean) => setData('is_active', v)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Role
                                </Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="teacher">Teacher (Regular)</SelectItem>
                                        <SelectItem value="class-teacher">Class Teacher (Extended permissions)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={`/teachers/${teacher.id}`}>Cancel</Link>
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
