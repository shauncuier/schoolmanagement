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
import { ArrowLeft, Key, Save, Shield, UserCheck } from 'lucide-react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Teachers', href: '/teachers' },
    { title: 'Create', href: '/teachers/create' },
];

interface Props {
    availableRoles?: string[];
}

export default function CreateTeacher({ availableRoles = ['teacher', 'class-teacher'] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        employee_id: '',
        designation: '',
        department: '',
        joining_date: new Date().toISOString().split('T')[0],
        qualification: '',
        specialization: '',
        salary: '',
        employment_type: 'full-time',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teachers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Teacher" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/teachers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Add Teacher
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Register a new teacher with login credentials
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Login Credentials */}
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Key className="h-5 w-5" />
                                Login Credentials
                            </CardTitle>
                            <CardDescription>
                                The teacher will use these credentials to login to the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email (Username) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="teacher@school.com"
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Leave empty for default: password123"
                                    className={errors.password ? 'border-destructive' : ''}
                                />
                                <p className="text-xs text-gray-500">Min 8 characters. Default: password123</p>
                                <InputError message={errors.password} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Role <span className="text-destructive">*</span>
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
                                <p className="text-xs text-gray-500">
                                    Class teachers can edit student details and create notices
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Teacher profile and identification details
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
                                <Label htmlFor="employee_id">Employee ID</Label>
                                <Input
                                    id="employee_id"
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                    placeholder="e.g., TCH-001"
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
                                    placeholder="e.g., Senior Teacher"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    placeholder="e.g., Science"
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
                                    placeholder="Monthly salary"
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
                                    placeholder="e.g., M.Sc. in Physics"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    value={data.specialization}
                                    onChange={(e) => setData('specialization', e.target.value)}
                                    placeholder="e.g., Quantum Mechanics"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/teachers">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Teacher'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
