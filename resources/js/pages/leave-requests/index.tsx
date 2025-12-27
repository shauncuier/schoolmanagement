import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
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
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Check, Clock, FileText, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attendance', href: '/attendance' },
    { title: 'Leave Requests', href: '/leave-requests' },
];

interface Requestable {
    id: number;
    name?: string;
    first_name?: string;
    last_name?: string;
    admission_number?: string;
}

interface Reviewer {
    id: number;
    name: string;
}

interface LeaveRequest {
    id: number;
    requestable_type: string;
    requestable_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: string;
    reviewed_at: string | null;
    review_remarks: string | null;
    created_at: string;
    requestable: Requestable;
    reviewer?: Reviewer;
}

interface PaginatedData {
    data: LeaveRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    leaveRequests: PaginatedData;
    stats: {
        pending: number;
        approved: number;
        rejected: number;
    };
    leaveTypes: Record<string, string>;
    filters: {
        status?: string;
        type?: string;
        requester?: string;
        search?: string;
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export default function LeaveRequestsIndex({ leaveRequests, stats, leaveTypes, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject'; request: LeaveRequest } | null>(null);

    const actionForm = useForm({
        remarks: '',
    });

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const params = new URLSearchParams();
        const merged = { ...filters, ...newFilters };
        if (merged.search) params.set('search', merged.search);
        if (merged.status && merged.status !== 'all') params.set('status', merged.status);
        if (merged.type && merged.type !== 'all') params.set('type', merged.type);
        if (merged.requester && merged.requester !== 'all') params.set('requester', merged.requester);
        router.get(`/leave-requests?${params.toString()}`);
    };

    const getRequesterName = (request: LeaveRequest) => {
        if (request.requestable?.first_name) {
            return `${request.requestable.first_name} ${request.requestable.last_name}`;
        }
        return request.requestable?.name ?? 'Unknown';
    };

    const getRequesterType = (request: LeaveRequest) => {
        return request.requestable_type.includes('Student') ? 'Student' : 'Staff';
    };

    const handleAction = () => {
        if (!actionModal) return;
        const route = actionModal.type === 'approve'
            ? `/leave-requests/${actionModal.request.id}/approve`
            : `/leave-requests/${actionModal.request.id}/reject`;

        actionForm.post(route, {
            onSuccess: () => {
                setActionModal(null);
                actionForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Requests" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Leave Requests
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage leave requests from students and staff
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/leave-requests/create">
                            <Plus className="h-4 w-4" />
                            New Request
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-yellow-200 dark:border-yellow-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-600">
                                <Clock className="h-4 w-4" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Awaiting review</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
                                <Check className="h-4 w-4" />
                                Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.approved}</p>
                            <p className="text-xs text-gray-500">This month</p>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
                                <X className="h-4 w-4" />
                                Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.rejected}</p>
                            <p className="text-xs text-gray-500">This month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4">
                            <form onSubmit={(e) => { e.preventDefault(); updateFilters({ search }); }} className="flex gap-2 flex-1 min-w-[200px]">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Search</Button>
                            </form>
                            <Select value={filters.status ?? 'all'} onValueChange={(v) => updateFilters({ status: v })}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.type ?? 'all'} onValueChange={(v) => updateFilters({ type: v })}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Leave Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {Object.entries(leaveTypes).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.requester ?? 'all'} onValueChange={(v) => updateFilters({ requester: v })}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Requester" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="student">Students</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {(leaveRequests.data?.length ?? 0) > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Requester</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="w-24">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveRequests.data.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{getRequesterName(request)}</p>
                                                    <Badge variant="outline" className="text-xs">
                                                        {getRequesterType(request)}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {leaveTypes[request.leave_type] ?? request.leave_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>{request.total_days}</TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[request.status]}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {request.status === 'pending' ? (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => setActionModal({ type: 'approve', request })}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => setActionModal({ type: 'reject', request })}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/leave-requests/${request.id}`}>View</Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <FileText className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Leave Requests</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    No leave requests found matching your filters.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {leaveRequests.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {(leaveRequests.current_page - 1) * leaveRequests.per_page + 1} to{' '}
                            {Math.min(leaveRequests.current_page * leaveRequests.per_page, leaveRequests.total)} of {leaveRequests.total}
                        </p>
                        <div className="flex gap-2">
                            {leaveRequests.current_page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/leave-requests?page=${leaveRequests.current_page - 1}`}>Previous</Link>
                                </Button>
                            )}
                            {leaveRequests.current_page < leaveRequests.last_page && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/leave-requests?page=${leaveRequests.current_page + 1}`}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            <Dialog open={!!actionModal} onOpenChange={() => setActionModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionModal?.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionModal?.type === 'approve'
                                ? 'This will approve the leave request and notify the requester.'
                                : 'Please provide a reason for rejecting this request.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="font-medium">{actionModal && getRequesterName(actionModal.request)}</p>
                            <p className="text-sm text-gray-500">
                                {actionModal?.request.total_days} days ({actionModal && leaveTypes[actionModal.request.leave_type]})
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="remarks">
                                Remarks {actionModal?.type === 'reject' && <span className="text-destructive">*</span>}
                            </Label>
                            <Textarea
                                id="remarks"
                                value={actionForm.data.remarks}
                                onChange={(e) => actionForm.setData('remarks', e.target.value)}
                                placeholder={actionModal?.type === 'approve' ? 'Optional remarks...' : 'Reason for rejection...'}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionModal(null)}>Cancel</Button>
                        <Button
                            onClick={handleAction}
                            disabled={actionForm.processing || (actionModal?.type === 'reject' && !actionForm.data.remarks)}
                            className={actionModal?.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {actionModal?.type === 'approve' ? 'Approve' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
