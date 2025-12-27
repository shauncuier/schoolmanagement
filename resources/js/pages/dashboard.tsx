import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem,
    type DashboardStats,
    type SchoolDashboardStats,
    type SuperAdminDashboardStats,
    type SharedData,
} from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Bell,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    GraduationCap,
    Layers,
    Plus,
    Settings,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    standard: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    premium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: number;
    trendLabel?: string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    color,
}: StatCardProps) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
        green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
        purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
        orange: 'from-orange-500 to-orange-600 shadow-orange-500/30',
        red: 'from-red-500 to-red-600 shadow-red-500/30',
        indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/30',
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                    {trend !== undefined && (
                        <div className="mt-2 flex items-center gap-1">
                            {trend >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span
                                className={`text-sm font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
                            >
                                {trend >= 0 ? '+' : ''}
                                {trend}%
                            </span>
                            {trendLabel && (
                                <span className="text-xs text-gray-400">
                                    {trendLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div
                    className={`rounded-2xl bg-gradient-to-br p-4 shadow-lg ${colorClasses[color]}`}
                >
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {/* Decorative gradient */}
            <div
                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 ${colorClasses[color]}`}
            />
        </div>
    );
}

function AttendanceCard({ attendance }: { attendance: SchoolDashboardStats['attendance_today'] }) {
    const safeAttendance = attendance ?? { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };
    const total = safeAttendance.total || 1;
    const presentPercent = Math.round((safeAttendance.present / total) * 100) || 0;
    const absentPercent = Math.round((safeAttendance.absent / total) * 100) || 0;
    const latePercent = Math.round((safeAttendance.late / total) * 100) || 0;

    return (
        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Today's Attendance
                </h3>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {safeAttendance.percentage}%
                </span>
            </div>

            <div className="mb-4 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="flex h-full">
                    <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                        style={{ width: `${presentPercent}%` }}
                    />
                    <div
                        className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                        style={{ width: `${latePercent}%` }}
                    />
                    <div
                        className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                        style={{ width: `${absentPercent}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{safeAttendance.present}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Present</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{safeAttendance.late}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Late</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{safeAttendance.absent}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Absent</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WelcomeCard({ userName, role }: { userName: string; role: string }) {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg">
            <div className="relative z-10">
                <p className="text-lg opacity-90">{greeting}!</p>
                <h2 className="mt-1 text-2xl font-bold">{userName}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                        <Clock className="h-4 w-4" />
                        {now.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                        <Badge variant="outline" className="border-white/40 text-white capitalize">
                            {role.replace(/-/g, ' ')}
                        </Badge>
                    </p>
                </div>
            </div>
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -right-4 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
        </div>
    );
}

function SchoolDashboard({ stats }: { stats: SchoolDashboardStats }) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Students" value={stats.total_students} icon={GraduationCap} color="blue" trend={5} trendLabel="vs last month" />
                <StatCard title="Total Teachers" value={stats.total_teachers} icon={Users} color="green" />
                <StatCard title="Total Classes" value={stats.total_classes} icon={BookOpen} color="purple" />
                <StatCard title="Total Sections" value={stats.total_sections} icon={Layers} color="orange" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <AttendanceCard attendance={stats.attendance_today} />
                <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/students/create" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <div className="rounded-lg bg-blue-500 p-2"><GraduationCap className="h-4 w-4 text-white" /></div>
                            <span className="text-sm font-medium">Add Student</span>
                        </Link>
                        <Link href="/attendance/mark" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <div className="rounded-lg bg-emerald-500 p-2"><Users className="h-4 w-4 text-white" /></div>
                            <span className="text-sm font-medium">Attendance</span>
                        </Link>
                        <Link href="/notices/create" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <div className="rounded-lg bg-purple-500 p-2"><Bell className="h-4 w-4 text-white" /></div>
                            <span className="text-sm font-medium">New Notice</span>
                        </Link>
                        <Link href="/exams/create" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <div className="rounded-lg bg-orange-500 p-2"><Calendar className="h-4 w-4 text-white" /></div>
                            <span className="text-sm font-medium">Schedule Exam</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Recent Notices</h3>
                        <Link href="/notices" className="text-sm text-blue-600 hover:underline">View all</Link>
                    </div>
                    {stats.recent_notices?.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recent_notices.slice(0, 5).map(notice => (
                                <div key={notice.id} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                    <Bell className="mt-0.5 h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium">{notice.title}</p>
                                        <p className="text-xs text-gray-500">{notice.publish_date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                            <Bell className="mb-2 h-12 w-12 opacity-20" />
                            <p>No recent notices</p>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Upcoming Events</h3>
                        <Link href="/events" className="text-sm text-blue-600 hover:underline">View all</Link>
                    </div>
                    {stats.upcoming_events?.length > 0 ? (
                        <div className="space-y-3">
                            {stats.upcoming_events.slice(0, 5).map(event => (
                                <div key={event.id} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                    <div className="rounded-lg p-2" style={{ backgroundColor: event.color + '20' }}>
                                        <Calendar className="h-4 w-4" style={{ color: event.color }} />
                                    </div>
                                    <div>
                                        <p className="font-medium">{event.title}</p>
                                        <p className="text-xs text-gray-500">{event.start_date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                            <Calendar className="mb-2 h-12 w-12 opacity-20" />
                            <p>No upcoming events</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function SuperAdminDashboard({ stats }: { stats: SuperAdminDashboardStats }) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Schools" value={stats.total_schools} icon={Building2} color="blue" />
                <StatCard title="Total Users" value={stats.total_users} icon={Users} color="green" />
                <StatCard title="Active Subs" value={stats.active_subscriptions} icon={CreditCard} color="purple" />
                <StatCard title="Monthly Revenue" value={`৳${stats.monthly_revenue.toLocaleString()}`} icon={DollarSign} color="orange" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold">Recent Registrations</h3>
                    <div className="space-y-3">
                        {stats.recent_schools.map(school => (
                            <div key={school.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500 text-white font-bold">
                                        {school.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{school.name}</p>
                                        <p className="text-xs text-gray-500">{school.created_at}</p>
                                    </div>
                                </div>
                                <Badge className={planColors[school.subscription_plan]}>
                                    {school.subscription_plan}
                                </Badge>
                            </div>
                        ))}
                        {stats.recent_schools.length === 0 && (
                            <p className="text-center py-8 text-gray-500">No schools registered yet.</p>
                        )}
                    </div>
                    <div className="mt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/admin/schools">View All Schools</Link>
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Admin Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/admin/schools/create" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <div className="rounded-lg bg-blue-500 p-2"><Plus className="h-4 w-4 text-white" /></div>
                            <span className="text-sm font-medium">Add School</span>
                        </Link>
                        <Link href="/admin/users" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <div className="rounded-lg bg-emerald-500 p-2"><Users className="h-4 w-4 text-white" /></div>
                            <span className="text-sm font-medium">All Users</span>
                        </Link>
                        <Link href="/admin/subscriptions" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <div className="rounded-lg bg-purple-500 p-2"><CreditCard className="h-4 w-4 text-white" /></div>
                            <span className="text-sm font-medium">Subscriptions</span>
                        </Link>
                        <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <div className="rounded-lg bg-orange-500 p-2"><Settings className="h-4 w-4 text-white" /></div>
                            <span className="text-sm font-medium">Sys Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

// Dashboard Stats Union is handled in Dashboard component

export default function Dashboard({ stats }: { stats?: DashboardStats }) {
    const { auth, roles } = usePage<SharedData>().props;
    const userRole = roles?.[0] || 'User';

    const isSuperAdmin = stats && 'is_super_admin' in stats && stats.is_super_admin;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <WelcomeCard userName={auth.user.name} role={userRole} />

                {isSuperAdmin ? (
                    <SuperAdminDashboard stats={stats as SuperAdminDashboardStats} />
                ) : (
                    <SchoolDashboard stats={stats as SchoolDashboardStats} />
                )}
            </div>
        </AppLayout>
    );
}
