import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Academic Years', href: '/academic-years' },
    { title: 'Create', href: '/academic-years/create' },
];

interface FormData {
    name: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'completed' | 'upcoming';
}

export default function CreateAcademicYear() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        start_date: '',
        end_date: '',
        status: 'upcoming',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/academic-years');
    };

    // Generate suggested name based on dates
    const suggestName = () => {
        if (data.start_date && data.end_date) {
            const startYear = new Date(data.start_date).getFullYear();
            const endYear = new Date(data.end_date).getFullYear();
            if (startYear !== endYear) {
                setData('name', `${startYear}-${endYear}`);
            } else {
                setData('name', `${startYear}`);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Academic Year" />

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
                            Create Academic Year
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add a new academic year for your school
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
                            Enter the details for the new academic year
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Academic Year Name <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g., 2024-2025"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={suggestName}
                                        disabled={!data.start_date || !data.end_date}
                                    >
                                        Suggest
                                    </Button>
                                </div>
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
                                    onValueChange={(value: FormData['status']) =>
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

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/academic-years">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Academic Year'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
