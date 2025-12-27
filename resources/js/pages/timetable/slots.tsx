import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Clock, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Timetable', href: '/timetable' },
    { title: 'Manage Slots', href: '/timetable/slots' },
];

interface TimetableSlot {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    type: string;
    order: number;
    is_active: boolean;
}

interface Props {
    slots: TimetableSlot[];
}

const typeColors: Record<string, string> = {
    class: 'bg-blue-100 text-blue-700',
    break: 'bg-amber-100 text-amber-700',
    lunch: 'bg-green-100 text-green-700',
    assembly: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700',
};

export default function ManageSlots({ slots = [] }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        start_time: '',
        end_time: '',
        type: 'class',
        order: (slots?.length ?? 0) + 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/timetable/slots', {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    };

    const handleDelete = (slotId: number) => {
        if (confirm('Are you sure you want to delete this slot?')) {
            router.delete(`/timetable/slots/${slotId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Time Slots" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/timetable">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Manage Time Slots
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Define periods, breaks, and other time slots
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4" />
                                Add Slot
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Add Time Slot</DialogTitle>
                                    <DialogDescription>
                                        Create a new period or break slot for the timetable.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g., Period 1, Break, Lunch"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_time">Start Time</Label>
                                            <Input
                                                id="start_time"
                                                type="time"
                                                value={data.start_time}
                                                onChange={(e) => setData('start_time', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_time">End Time</Label>
                                            <Input
                                                id="end_time"
                                                type="time"
                                                value={data.end_time}
                                                onChange={(e) => setData('end_time', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="class">Class Period</SelectItem>
                                                    <SelectItem value="break">Break</SelectItem>
                                                    <SelectItem value="lunch">Lunch</SelectItem>
                                                    <SelectItem value="assembly">Assembly</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="order">Order</Label>
                                            <Input
                                                id="order"
                                                type="number"
                                                min="0"
                                                value={data.order}
                                                onChange={(e) => setData('order', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Slot'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Slots Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Time Slots
                        </CardTitle>
                        <CardDescription>
                            {slots?.length ?? 0} slots defined
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {(slots?.length ?? 0) > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Order</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>End Time</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {slots.map((slot) => (
                                        <TableRow key={slot.id}>
                                            <TableCell className="font-mono text-sm">
                                                {slot.order}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {slot.name}
                                            </TableCell>
                                            <TableCell>
                                                {slot.start_time?.slice(0, 5)}
                                            </TableCell>
                                            <TableCell>
                                                {slot.end_time?.slice(0, 5)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={typeColors[slot.type] ?? ''}>
                                                    {slot.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={slot.is_active ? 'default' : 'secondary'}>
                                                    {slot.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(slot.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-8 text-center">
                                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium">No Time Slots</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Create time slots to define your school schedule.
                                </p>
                                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                                    <Plus className="h-4 w-4" />
                                    Add First Slot
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
