import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { ArrowLeft, GraduationCap, Save, UserCircle, X } from 'lucide-react';
import InputError from '@/components/input-error';

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
}

interface Props {
    guardian: Guardian;
    relationTypes?: string[];
    students?: Student[];
    linkedStudentIds?: number[];
}

export default function EditGuardian({ guardian, relationTypes = [], students = [], linkedStudentIds = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Parents', href: '/guardians' },
        { title: guardian.user?.name ?? 'Edit', href: `/guardians/${guardian.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: guardian.user?.name ?? '',
        email: guardian.user?.email ?? '',
        phone: guardian.user?.phone ?? '',
        occupation: guardian.occupation ?? '',
        workplace: guardian.workplace ?? '',
        annual_income: guardian.annual_income?.toString() ?? '',
        relation_type: guardian.relation_type ?? 'father',
        is_primary_contact: guardian.is_primary_contact ?? false,
        is_active: guardian.is_active ?? true,
        student_ids: linkedStudentIds,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/guardians/${guardian.id}`);
    };

    const toggleStudent = (studentId: number) => {
        if (data.student_ids.includes(studentId)) {
            setData('student_ids', data.student_ids.filter(id => id !== studentId));
        } else {
            setData('student_ids', [...data.student_ids, studentId]);
        }
    };

    const selectedStudents = students.filter(s => data.student_ids.includes(s.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${guardian.user?.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/guardians/${guardian.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Parent / Guardian
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update details for {guardian.user?.name}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5" />
                                Personal Information
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
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Relation Type <span className="text-destructive">*</span></Label>
                                <Select value={data.relation_type} onValueChange={(v) => setData('relation_type', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="father">Father</SelectItem>
                                        <SelectItem value="mother">Mother</SelectItem>
                                        <SelectItem value="guardian">Guardian</SelectItem>
                                        <SelectItem value="uncle">Uncle</SelectItem>
                                        <SelectItem value="aunt">Aunt</SelectItem>
                                        <SelectItem value="grandparent">Grandparent</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="occupation">Occupation</Label>
                                <Input
                                    id="occupation"
                                    value={data.occupation}
                                    onChange={(e) => setData('occupation', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workplace">Workplace</Label>
                                <Input
                                    id="workplace"
                                    value={data.workplace}
                                    onChange={(e) => setData('workplace', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="annual_income">Annual Income</Label>
                                <Input
                                    id="annual_income"
                                    type="number"
                                    value={data.annual_income}
                                    onChange={(e) => setData('annual_income', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <Checkbox
                                    id="is_primary_contact"
                                    checked={data.is_primary_contact}
                                    onCheckedChange={(v) => setData('is_primary_contact', v === true)}
                                />
                                <Label htmlFor="is_primary_contact" className="cursor-pointer">
                                    Primary contact for students
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Link Children */}
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <GraduationCap className="h-5 w-5" />
                                Link Children (Students)
                            </CardTitle>
                            <CardDescription>
                                Select the students who are children of this parent/guardian
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Selected students */}
                            {selectedStudents.length > 0 && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {selectedStudents.map((student) => (
                                        <Badge key={student.id} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                                            {student.first_name} {student.last_name}
                                            <button
                                                type="button"
                                                onClick={() => toggleStudent(student.id)}
                                                className="ml-1 hover:bg-gray-300 rounded p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Student list */}
                            {students.length > 0 ? (
                                <div className="grid gap-2 max-h-64 overflow-y-auto">
                                    {students.map((student) => (
                                        <div
                                            key={student.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${data.student_ids.includes(student.id)
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                                }`}
                                            onClick={() => toggleStudent(student.id)}
                                        >
                                            <Checkbox
                                                checked={data.student_ids.includes(student.id)}
                                                onCheckedChange={() => toggleStudent(student.id)}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {student.first_name} {student.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {student.section?.school_class?.name ?? 'No class'} - {student.section?.name ?? 'No section'}
                                                    {student.admission_number && ` • ${student.admission_number}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No students available.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Status */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Active Status</Label>
                                    <p className="text-sm text-gray-500">Set whether this parent is currently active</p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(v: boolean) => setData('is_active', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={`/guardians/${guardian.id}`}>Cancel</Link>
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
