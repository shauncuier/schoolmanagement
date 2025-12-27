import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
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
import { ArrowLeft, BookOpenCheck, Save } from 'lucide-react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Subjects', href: '/subjects' },
    { title: 'Create', href: '/subjects/create' },
];

interface FormData {
    name: string;
    code: string;
    description: string;
    type: string;
    is_optional: boolean;
    is_active: boolean;
}

export default function CreateSubject() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        code: '',
        description: '',
        type: 'theory',
        is_optional: false,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/subjects');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Subject" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/subjects">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create Subject
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add a new subject to your curriculum
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="mx-auto w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpenCheck className="h-5 w-5" />
                            Subject Details
                        </CardTitle>
                        <CardDescription>
                            Enter the details for the new subject
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name and Code */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Subject Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="e.g., Mathematics, English"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Subject Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        placeholder="e.g., MATH, ENG"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    />
                                </div>
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Subject Type</Label>
                                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="theory">Theory</SelectItem>
                                        <SelectItem value="practical">Practical</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    placeholder="Optional description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_optional"
                                        checked={data.is_optional}
                                        onCheckedChange={(checked) => setData('is_optional', checked === true)}
                                    />
                                    <Label htmlFor="is_optional" className="font-normal">
                                        Optional subject (students can choose to take this)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <Label htmlFor="is_active" className="font-normal">
                                        Active (available for assignment)
                                    </Label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/subjects">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Subject'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
