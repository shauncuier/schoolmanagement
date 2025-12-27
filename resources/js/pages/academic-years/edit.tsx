import AppLayout from '@/layouts/app-layout';
import { type AcademicYear, type BreadcrumbItem } from '@/types';
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
import { ArrowLeft, Calendar, Save } from 'lucide-react';
import InputError from '@/components/input-error';

interface Props {
    academicYear: AcademicYear;
}

export default function EditAcademicYear({ academicYear }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Academic Years', href: '/academic-years' },
        { title: academicYear.name, href: `/academic-years/${academicYear.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: academicYear.name,
        start_date: academicYear.start_date,
        end_date: academicYear.end_date,
        status: academicYear.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/academic-years/${academicYear.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${academicYear.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/academic-years">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Academic Year
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update the details for {academicYear.name}
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="mx-auto w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Academic Year Details
                        </CardTitle>
                        <CardDescription>
                            Modify the academic year information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Academic Year Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="e.g., 2024-2025"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Date Range */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        Start Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className={errors.start_date ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">
                                        End Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className={errors.end_date ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Status <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value: AcademicYear['status']) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="status"
                                        className={errors.status ? 'border-destructive' : ''}
                                    >
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            {/* Current Status Info */}
                            {academicYear.is_current && (
                                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                    <p className="font-medium">
                                        This is the current academic year
                                    </p>
                                    <p className="mt-1 text-blue-600 dark:text-blue-400">
                                        All new students and sections will be associated with this
                                        academic year by default.
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/academic-years">Cancel</Link>
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
