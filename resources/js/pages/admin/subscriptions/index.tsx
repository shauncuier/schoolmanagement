import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Clock,
    CreditCard,
    MoreHorizontal,
    Plus,
    Search,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin/subscriptions' },
    { title: 'Subscriptions', href: '/admin/subscriptions' },
];

interface Subscription {
    id: string;
    name: string;
    email: string | null;
    status: string;
    subscription_plan: string;
    subscription_ends_at: string | null;
    is_expired: boolean;
    days_until_expiry: number | null;
    users_count: number;
    created_at: string;
}

interface Plan {
    value: string;
    label: string;
    price: number;
    features: string[];
}

interface Stats {
    total: number;
    free: number;
    basic: number;
    standard: number;
    premium: number;
    expiring_soon: number;
    expired: number;
}

interface Filters {
    search?: string;
    plan?: string;
    subscription_status?: string;
}

interface Props {
    subscriptions: PaginatedResponse<Subscription>;
    stats: Stats;
    plans: Plan[];
    filters: Filters;
}

const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    standard: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    premium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function SubscriptionsIndex({ subscriptions, stats, plans, filters }: Props) {
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [extendDialogOpen, setExtendDialogOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<Subscription | null>(null);
    const [newPlan, setNewPlan] = useState('free');
    const [expiryDate, setExpiryDate] = useState('');
    const [extendDays, setExtendDays] = useState('30');
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const handleUpdatePlan = () => {
        if (!selectedSchool) return;
        setIsProcessing(true);
        router.put(`/admin/subscriptions/${selectedSchool.id}`, {
            subscription_plan: newPlan,
            subscription_ends_at: expiryDate || null,
        }, {
            onFinish: () => {
                setIsProcessing(false);
                setUpdateDialogOpen(false);
                setSelectedSchool(null);
            },
        });
    };

    const handleExtend = () => {
        if (!selectedSchool) return;
        setIsProcessing(true);
        router.post(`/admin/subscriptions/${selectedSchool.id}/extend`, {
            days: parseInt(extendDays),
        }, {
            onFinish: () => {
                setIsProcessing(false);
                setExtendDialogOpen(false);
                setSelectedSchool(null);
            },
        });
    };

    const handleCancel = (school: Subscription) => {
        if (confirm(`Cancel subscription for ${school.name}? They will be reverted to the free plan.`)) {
            router.post(`/admin/subscriptions/${school.id}/cancel`);
        }
    };

    const applyFilter = (key: string, value: string) => {
        const params = new URLSearchParams();
        const newFilters = { ...filters, [key]: value };

        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== 'all') params.set(k, v);
        });

        router.get(`/admin/subscriptions?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', searchValue);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getExpiryStatus = (school: Subscription) => {
        if (school.subscription_plan === 'free') return null;
        if (!school.subscription_ends_at) return { label: 'Lifetime', color: 'bg-emerald-100 text-emerald-700' };
        if (school.is_expired) return { label: 'Expired', color: 'bg-red-100 text-red-700' };
        if (school.days_until_expiry !== null && school.days_until_expiry <= 30) {
            return { label: `${school.days_until_expiry} days`, color: 'bg-amber-100 text-amber-700' };
        }
        return { label: `${school.days_until_expiry} days`, color: 'bg-emerald-100 text-emerald-700' };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscriptions Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Subscriptions
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage school subscription plans
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Free</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{stats.free}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600">Basic</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.basic}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-purple-600">Standard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.standard}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-amber-600">Premium</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.premium}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-orange-600">Expiring</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.expiring_soon}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">Expired</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search by school name..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>
                            <div className="flex gap-2">
                                <Select
                                    value={filters.plan ?? 'all'}
                                    onValueChange={(v) => applyFilter('plan', v)}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Plans" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Plans</SelectItem>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.subscription_status ?? 'all'}
                                    onValueChange={(v) => applyFilter('subscription_status', v)}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscriptions Table */}
                {(subscriptions?.data?.length ?? 0) > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>School</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Expires</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscriptions.data.map((school) => {
                                        const expiryStatus = getExpiryStatus(school);
                                        return (
                                            <TableRow key={school.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                                                            {school.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/admin/schools/${school.id}`}
                                                                className="font-medium text-gray-900 dark:text-white hover:underline"
                                                            >
                                                                {school.name}
                                                            </Link>
                                                            <p className="text-sm text-gray-500">{school.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={planColors[school.subscription_plan]}>
                                                        {school.subscription_plan}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Users className="h-4 w-4" />
                                                        {school.users_count}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {school.subscription_plan === 'free' ? (
                                                        <span className="text-gray-500">N/A</span>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            {formatDate(school.subscription_ends_at)}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {expiryStatus ? (
                                                        <Badge className={expiryStatus.color}>
                                                            {school.is_expired && <AlertTriangle className="mr-1 h-3 w-3" />}
                                                            {expiryStatus.label}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedSchool(school);
                                                                    setNewPlan(school.subscription_plan);
                                                                    setExpiryDate(school.subscription_ends_at?.split('T')[0] || '');
                                                                    setUpdateDialogOpen(true);
                                                                }}
                                                            >
                                                                <CreditCard className="mr-2 h-4 w-4" />
                                                                Change Plan
                                                            </DropdownMenuItem>
                                                            {school.subscription_plan !== 'free' && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedSchool(school);
                                                                            setExtendDays('30');
                                                                            setExtendDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Extend Subscription
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive"
                                                                        onClick={() => handleCancel(school)}
                                                                    >
                                                                        Cancel Subscription
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16">
                        <CreditCard className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No Subscriptions Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Try adjusting your search or filters.
                        </p>
                    </Card>
                )}

                {/* Pagination */}
                {(subscriptions?.last_page ?? 0) > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: subscriptions.last_page }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={subscriptions.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={`/admin/subscriptions?page=${i + 1}`}>{i + 1}</Link>
                            </Button>
                        ))}
                    </div>
                )}

                {/* Plan Cards */}
                <div className="mt-4">
                    <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
                    <div className="grid gap-4 md:grid-cols-4">
                        {plans.map((plan) => (
                            <Card key={plan.value} className={plan.value === 'premium' ? 'border-amber-500 border-2' : ''}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="capitalize">{plan.label}</span>
                                        {plan.value === 'premium' && (
                                            <Badge className="bg-amber-500 text-white">Popular</Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        <span className="text-2xl font-bold">৳{plan.price}</span>
                                        {plan.price > 0 && <span className="text-gray-500">/month</span>}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Update Plan Dialog */}
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Subscription</DialogTitle>
                        <DialogDescription>
                            Change subscription plan for {selectedSchool?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Subscription Plan</Label>
                            <Select value={newPlan} onValueChange={setNewPlan}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {newPlan !== 'free' && (
                            <div className="space-y-2">
                                <Label>Expiry Date</Label>
                                <Input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <p className="text-xs text-gray-500">
                                    Leave blank for lifetime subscription
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePlan} disabled={isProcessing}>
                            {isProcessing ? 'Updating...' : 'Update Plan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Extend Dialog */}
            <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Extend Subscription</DialogTitle>
                        <DialogDescription>
                            Extend subscription for {selectedSchool?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Extend by (days)</Label>
                            <Select value={extendDays} onValueChange={setExtendDays}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 days</SelectItem>
                                    <SelectItem value="14">14 days</SelectItem>
                                    <SelectItem value="30">30 days</SelectItem>
                                    <SelectItem value="60">60 days</SelectItem>
                                    <SelectItem value="90">90 days</SelectItem>
                                    <SelectItem value="180">180 days</SelectItem>
                                    <SelectItem value="365">1 year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-500">Current expiry:</span>
                                <span className="font-medium">
                                    {formatDate(selectedSchool?.subscription_ends_at ?? null)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleExtend} disabled={isProcessing}>
                            {isProcessing ? 'Extending...' : 'Extend Subscription'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
