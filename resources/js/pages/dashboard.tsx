import AppLayout from '@/layouts/app-layout';
import {
    type BreadcrumbItem,
    type DashboardStats,
    type SharedData,
} from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Bell,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    GraduationCap,
    Layers,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

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

interface AttendanceCardProps {
    attendance: DashboardStats['attendance_today'];
}

function AttendanceCard({ attendance }: AttendanceCardProps) {
    const total = attendance.total || 1; // Prevent division by zero
    const presentPercent = Math.round((attendance.present / total) * 100) || 0;
    const absentPercent = Math.round((attendance.absent / total) * 100) || 0;
    const latePercent = Math.round((attendance.late / total) * 100) || 0;

    return (
        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Today's Attendance
                </h3>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {attendance.percentage}%
                </span>
            </div>

            {/* Visual bar */}
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {attendance.present}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Present
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {attendance.late}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Late
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {attendance.absent}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Absent
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickActions() {
    const actions = [
        {
            icon: GraduationCap,
            label: 'Add Student',
            href: '/students/create',
            color: 'bg-blue-500',
        },
        {
            icon: Users,
            label: 'Mark Attendance',
            href: '/attendance/mark',
            color: 'bg-emerald-500',
        },
        {
            icon: Bell,
            label: 'New Notice',
            href: '/notices/create',
            color: 'bg-purple-500',
        },
        {
            icon: Calendar,
            label: 'Schedule Exam',
            href: '/exams/create',
            color: 'bg-orange-500',
        },
    ];

    return (
        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => (
                    <a
                        key={action.label}
                        href={action.href}
                        className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-all duration-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        <div className={`rounded-lg p-2 ${action.color}`}>
                            <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {action.label}
                        </span>
                    </a>
                ))}
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
                <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                    <Clock className="h-4 w-4" />
                    {now.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
                <p className="mt-2 text-sm opacity-75">Role: {role}</p>
            </div>
            {/* Decorative shapes */}
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -right-4 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
        </div>
    );
}

interface DashboardProps {
    stats?: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
    const { auth, roles } = usePage<SharedData>().props;
    const user = auth.user;
    const userRole = roles?.[0] || 'User';

    const dashboardStats = stats || {
        total_students: 0,
        total_teachers: 0,
        total_classes: 0,
        total_sections: 0,
        attendance_today: {
            present: 0,
            absent: 0,
            late: 0,
            total: 0,
            percentage: 0,
        },
        fee_collection: { collected: 0, pending: 0, total: 0 },
        recent_notices: [],
        upcoming_events: [],
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Welcome Card */}
                <WelcomeCard
                    userName={user.name}
                    role={userRole
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                />

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Students"
                        value={dashboardStats.total_students}
                        icon={GraduationCap}
                        color="blue"
                        trend={5}
                        trendLabel="vs last month"
                    />
                    <StatCard
                        title="Total Teachers"
                        value={dashboardStats.total_teachers}
                        icon={Users}
                        color="green"
                    />
                    <StatCard
                        title="Total Classes"
                        value={dashboardStats.total_classes}
                        icon={BookOpen}
                        color="purple"
                    />
                    <StatCard
                        title="Total Sections"
                        value={dashboardStats.total_sections}
                        icon={Layers}
                        color="orange"
                    />
                </div>

                {/* Second Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <AttendanceCard
                        attendance={dashboardStats.attendance_today}
                    />
                    <QuickActions />
                </div>

                {/* Third Row - Notices & Events */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Notices */}
                    <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Notices
                            </h3>
                            <a
                                href="/notices"
                                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                            >
                                View all
                            </a>
                        </div>
                        {dashboardStats.recent_notices.length > 0 ? (
                            <div className="space-y-3">
                                {dashboardStats.recent_notices
                                    .slice(0, 5)
                                    .map((notice) => (
                                        <div
                                            key={notice.id}
                                            className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                                        >
                                            <Bell className="mt-0.5 h-5 w-5 text-blue-500" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {notice.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {notice.publish_date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Bell className="mb-2 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No recent notices
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Events */}
                    <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Upcoming Events
                            </h3>
                            <a
                                href="/events"
                                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                            >
                                View all
                            </a>
                        </div>
                        {dashboardStats.upcoming_events.length > 0 ? (
                            <div className="space-y-3">
                                {dashboardStats.upcoming_events
                                    .slice(0, 5)
                                    .map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                                        >
                                            <div
                                                className="rounded-lg p-2"
                                                style={{
                                                    backgroundColor:
                                                        event.color + '20',
                                                }}
                                            >
                                                <Calendar
                                                    className="h-4 w-4"
                                                    style={{
                                                        color: event.color,
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {event.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {event.start_date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Calendar className="mb-2 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No upcoming events
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
