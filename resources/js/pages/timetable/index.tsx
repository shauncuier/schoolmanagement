import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SchoolClass } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Calendar, Clock, Edit, Settings } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Timetable', href: '/timetable' },
];

interface Section {
    id: number;
    name: string;
    school_class?: { id: number; name: string };
}

interface TimetableSlot {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    type: string;
}

interface TimetableEntry {
    id: number;
    subject?: { id: number; name: string; code: string | null };
    teacher?: { id: number; name: string };
    room: string | null;
}

interface Props {
    classes: (SchoolClass & { sections: Section[] })[];
    selectedSection: Section | null;
    timetableData: Record<string, Record<number, TimetableEntry | null>>;
    slots: TimetableSlot[];
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const dayLabels: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
};

const slotTypeColors: Record<string, string> = {
    class: 'bg-blue-50 dark:bg-blue-900/20',
    break: 'bg-amber-50 dark:bg-amber-900/20',
    lunch: 'bg-green-50 dark:bg-green-900/20',
    assembly: 'bg-purple-50 dark:bg-purple-900/20',
    other: 'bg-gray-50 dark:bg-gray-900/20',
};

export default function TimetableIndex({ classes = [], selectedSection, timetableData = {}, slots = [] }: Props) {
    const [selectedSectionId, setSelectedSectionId] = useState(selectedSection?.id?.toString() ?? '');

    const handleSectionChange = (sectionId: string) => {
        setSelectedSectionId(sectionId);
        router.get(`/timetable?section_id=${sectionId}`);
    };

    // Get all sections flat
    const allSections = (classes ?? []).flatMap((c) =>
        (c.sections ?? []).map((s) => ({ ...s, className: c.name }))
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Timetable" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Timetable
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            View and manage class schedules
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/timetable/slots">
                                <Settings className="h-4 w-4" />
                                Manage Slots
                            </Link>
                        </Button>
                        {selectedSection && (
                            <Button asChild>
                                <Link href={`/timetable/edit?section_id=${selectedSection.id}`}>
                                    <Edit className="h-4 w-4" />
                                    Edit Timetable
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Section Selector */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <Select value={selectedSectionId} onValueChange={handleSectionChange}>
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="Select a class and section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allSections.map((section) => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                            {section.className} - Section {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Timetable Grid */}
                {selectedSection ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedSection.school_class?.name} - Section {selectedSection.name}
                            </CardTitle>
                            <CardDescription>
                                Weekly schedule
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <div className="min-w-[800px]">
                                {/* Header Row */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    <div className="p-2 text-center font-medium text-gray-500">Time</div>
                                    {days.map((day) => (
                                        <div key={day} className="p-2 text-center font-semibold">
                                            {dayLabels[day]}
                                        </div>
                                    ))}
                                </div>

                                {/* Slot Rows */}
                                {(slots ?? []).map((slot) => (
                                    <div key={slot.id} className="grid grid-cols-7 gap-1 mb-1">
                                        {/* Time Column */}
                                        <div className={`p-2 rounded ${slotTypeColors[slot.type]} text-center`}>
                                            <p className="text-xs font-medium">{slot.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                            </p>
                                        </div>

                                        {/* Day Columns */}
                                        {days.map((day) => {
                                            const entry = timetableData[day]?.[slot.id];

                                            if (slot.type !== 'class') {
                                                return (
                                                    <div
                                                        key={day}
                                                        className={`p-2 rounded ${slotTypeColors[slot.type]} text-center`}
                                                    >
                                                        <span className="text-xs text-gray-500 capitalize">
                                                            {slot.type}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={day}
                                                    className={`p-2 rounded border ${entry
                                                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                            : 'bg-gray-50 dark:bg-gray-900 border-dashed border-gray-200 dark:border-gray-700'
                                                        }`}
                                                >
                                                    {entry ? (
                                                        <div className="text-center">
                                                            <p className="text-sm font-medium truncate">
                                                                {entry.subject?.name ?? '-'}
                                                            </p>
                                                            {entry.subject?.code && (
                                                                <Badge variant="outline" className="text-xs mt-1">
                                                                    {entry.subject.code}
                                                                </Badge>
                                                            )}
                                                            {entry.teacher && (
                                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                                    {entry.teacher.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 text-center">-</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <Clock className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Select a Section
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Choose a class and section to view the timetable.
                        </p>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
