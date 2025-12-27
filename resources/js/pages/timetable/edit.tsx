import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

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

interface Subject {
    id: number;
    name: string;
    code: string | null;
}

interface Teacher {
    id: number;
    name: string;
}

interface EntryData {
    id: number | null;
    subject_id: string;
    teacher_id: string;
    room: string;
}

interface Props {
    section: Section;
    slots: TimetableSlot[];
    subjects: Subject[];
    teachers: Teacher[];
    timetableData: Record<string, Record<number, EntryData>>;
    days: string[];
}

const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
};

export default function EditTimetable({ section, slots = [], subjects = [], teachers = [], timetableData, days = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Timetable', href: '/timetable' },
        { title: `Edit - ${section.school_class?.name} ${section.name}`, href: '#' },
    ];

    const [processing, setProcessing] = useState(false);

    // Build entries from form
    const buildEntries = () => {
        const entries: { day: string; slot_id: number; subject_id: string; teacher_id: string; room: string }[] = [];
        (days ?? []).forEach((day) => {
            (slots ?? []).filter(s => s.type === 'class').forEach((slot) => {
                const cellId = `${day}-${slot.id}`;
                const subjectEl = document.getElementById(`subject-${cellId}`) as HTMLSelectElement;
                const teacherEl = document.getElementById(`teacher-${cellId}`) as HTMLSelectElement;
                const subjectVal = subjectEl?.getAttribute('data-value') || '';
                const teacherVal = teacherEl?.getAttribute('data-value') || '';

                entries.push({
                    day,
                    slot_id: slot.id,
                    subject_id: subjectVal === 'none' ? '' : subjectVal,
                    teacher_id: teacherVal === 'none' ? '' : teacherVal,
                    room: '',
                });
            });
        });
        return entries;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const entries = buildEntries();
        router.post('/timetable', {
            section_id: section.id,
            entries,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Timetable - ${section.school_class?.name} ${section.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/timetable?section_id=${section.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Timetable
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {section.school_class?.name} - Section {section.name}
                        </p>
                    </div>
                    <Button type="submit" form="timetable-form" disabled={processing}>
                        <Save className="h-4 w-4" />
                        {processing ? 'Saving...' : 'Save Timetable'}
                    </Button>
                </div>

                {/* Timetable Form */}
                <form id="timetable-form" onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Schedule</CardTitle>
                            <CardDescription>
                                Select subjects and teachers for each period
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <div className="min-w-[1000px]">
                                {/* Header Row */}
                                <div className="grid grid-cols-7 gap-2 mb-3">
                                    <div className="p-2 text-center font-medium text-gray-500">Period</div>
                                    {(days ?? []).map((day) => (
                                        <div key={day} className="p-2 text-center font-semibold">
                                            {dayLabels[day]}
                                        </div>
                                    ))}
                                </div>

                                {/* Slot Rows */}
                                {(slots ?? []).map((slot) => {
                                    if (slot.type !== 'class') {
                                        return (
                                            <div key={slot.id} className="grid grid-cols-7 gap-2 mb-2">
                                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-center">
                                                    <p className="text-sm font-medium">{slot.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                                    </p>
                                                </div>
                                                {(days ?? []).map((day) => (
                                                    <div key={day} className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-center">
                                                        <span className="text-xs text-gray-500 capitalize">{slot.type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={slot.id} className="grid grid-cols-7 gap-2 mb-2">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
                                                <p className="text-sm font-medium">{slot.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                                </p>
                                            </div>
                                            {(days ?? []).map((day) => {
                                                const cellId = `${day}-${slot.id}`;
                                                const existing = timetableData?.[day]?.[slot.id];

                                                return (
                                                    <div key={day} className="space-y-1">
                                                        <Select
                                                            defaultValue={existing?.subject_id?.toString() ?? ''}
                                                            name={`subject-${cellId}`}
                                                        >
                                                            <SelectTrigger id={`subject-${cellId}`} className="h-8 text-xs">
                                                                <SelectValue placeholder="Subject" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">None</SelectItem>
                                                                {(subjects ?? []).map((s) => (
                                                                    <SelectItem key={s.id} value={s.id.toString()}>
                                                                        {s.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Select
                                                            defaultValue={existing?.teacher_id?.toString() ?? ''}
                                                            name={`teacher-${cellId}`}
                                                        >
                                                            <SelectTrigger id={`teacher-${cellId}`} className="h-8 text-xs">
                                                                <SelectValue placeholder="Teacher" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">None</SelectItem>
                                                                {(teachers ?? []).map((t) => (
                                                                    <SelectItem key={t.id} value={t.id.toString()}>
                                                                        {t.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
