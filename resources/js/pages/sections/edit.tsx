import AppLayout from '@/layouts/app-layout';
import { type AcademicYear, type BreadcrumbItem, type SchoolClass } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ArrowLeft, Layers, Save } from 'lucide-react';
import InputError from '@/components/input-error';

interface Teacher {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    capacity: number;
    room_number: string | null;
    is_active: boolean;
    class_id: number;
    academic_year_id: number;
    class_teacher_id: number | null;
    school_class: SchoolClass;
    academic_year: AcademicYear;
}

interface Props {
    section: Section;
    classes: SchoolClass[];
    academicYears: AcademicYear[];
    teachers: Teacher[];
}

export default function EditSection({ section, classes = [], academicYears = [], teachers = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sections', href: '/sections' },
        { title: `${section.school_class.name} - ${section.name}`, href: `/sections/${section.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        class_id: section.class_id.toString(),
        academic_year_id: section.academic_year_id.toString(),
        name: section.name,
        capacity: section.capacity.toString(),
        class_teacher_id: section.class_teacher_id?.toString() ?? '',
        room_number: section.room_number ?? '',
        is_active: section.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/sections/${section.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${section.school_class.name} - ${section.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/sections">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Section
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update details for {section.school_class.name} - {section.name}
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="mx-auto w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Section Details
                        </CardTitle>
                        <CardDescription>
                            Modify the section information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Class and Academic Year */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="class_id">
                                        Class <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.class_id}
                                        onValueChange={(value) => setData('class_id', value)}
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
                                    <Label htmlFor="academic_year_id">
                                        Academic Year <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.academic_year_id}
                                        onValueChange={(value) => setData('academic_year_id', value)}
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
                            </div>

                            {/* Section Name and Capacity */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Section Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g., A, B, Morning"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">
                                        Capacity <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        max="200"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', e.target.value)}
                                        className={errors.capacity ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.capacity} />
                                </div>
                            </div>

                            {/* Class Teacher and Room */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="class_teacher_id">Class Teacher</Label>
                                    <Select
                                        value={data.class_teacher_id}
                                        onValueChange={(value) => setData('class_teacher_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select teacher (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">None</SelectItem>
                                            {(teachers ?? []).map((t) => (
                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="room_number">Room Number</Label>
                                    <Input
                                        id="room_number"
                                        type="text"
                                        placeholder="e.g., 101, Lab-2"
                                        value={data.room_number}
                                        onChange={(e) => setData('room_number', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked === true)}
                                />
                                <Label htmlFor="is_active" className="font-normal">
                                    Active (available for student enrollment)
                                </Label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/sections">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
