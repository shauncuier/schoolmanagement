import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SchoolClass } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Calendar, Layers, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attendance', href: '/attendance' },
    { title: 'Select Section', href: '/attendance/select-section' },
];

interface Section {
    id: number;
    name: string;
    capacity: number;
}

interface Props {
    classes: (SchoolClass & { sections: Section[] })[];
    selectedDate: string;
}

export default function SelectSection({ classes = [], selectedDate }: Props) {
    const [date, setDate] = useState(selectedDate);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Select Section" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/attendance">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Mark Attendance
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Select a class and section to mark attendance
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-auto"
                        />
                    </div>
                </div>

                {/* Classes and Sections */}
                {(classes?.length ?? 0) > 0 ? (
                    <div className="grid gap-6">
                        {classes.map((cls) => (
                            <Card key={cls.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        {cls.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {cls.sections?.length ?? 0} sections available
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {(cls.sections?.length ?? 0) > 0 ? (
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {cls.sections.map((section) => (
                                                <Link
                                                    key={section.id}
                                                    href={`/attendance/mark?section_id=${section.id}&date=${date}`}
                                                    className="group"
                                                >
                                                    <Card className="transition-all hover:border-primary hover:shadow-md">
                                                        <CardContent className="flex items-center justify-between p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                                                                    {section.name}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">
                                                                        Section {section.name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        Capacity: {section.capacity}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            No sections in this class.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <Layers className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No Classes Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Create classes and sections first to mark attendance.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/classes/create">Create Class</Link>
                        </Button>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
