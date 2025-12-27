import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    BookOpen,
    BookOpenCheck,
    Building2,
    Bus,
    Calendar,
    CalendarDays,
    ClipboardList,
    Clock,
    CreditCard,
    FileText,
    GraduationCap,
    Home,
    LayoutGrid,
    Library,
    MessageSquare,
    Package,
    Settings,
    Shield,
    UserCheck,
    UserCog,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

// Navigation items for Super Admin
const superAdminNav: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    {
        title: 'Schools',
        href: '/admin/schools',
        icon: Building2,
        permission: 'manage-tenants',
    },
    {
        title: 'All Users',
        href: '/admin/users',
        icon: Users,
        permission: 'manage-users',
    },
    {
        title: 'Subscriptions',
        href: '/admin/subscriptions',
        icon: CreditCard,
        permission: 'manage-tenants',
    },
    {
        title: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
        permission: 'manage-settings',
    },
];

// Academic Management
const academicNav: NavItem[] = [
    {
        title: 'Academic Years',
        href: '/academic-years',
        icon: CalendarDays,
        permission: 'view-academic-years',
    },
    {
        title: 'Classes',
        href: '/classes',
        icon: BookOpen,
        permission: 'view-classes',
    },
    {
        title: 'Sections',
        href: '/sections',
        icon: Users,
        permission: 'view-sections',
    },
    {
        title: 'Subjects',
        href: '/subjects',
        icon: BookOpenCheck,
        permission: 'view-subjects',
    },
    {
        title: 'Timetable',
        href: '/timetable',
        icon: Clock,
        permission: 'view-timetable',
    },
];

// People Management
const peopleNav: NavItem[] = [
    {
        title: 'Students',
        href: '/students',
        icon: GraduationCap,
        permission: 'view-students',
    },
    {
        title: 'Teachers',
        href: '/teachers',
        icon: UserCheck,
        permission: 'view-teachers',
    },
    {
        title: 'Parents',
        href: '/guardians',
        icon: Users,
        permission: 'view-guardians',
    },
    { title: 'Staff', href: '/staff', icon: UserCog, permission: 'view-users' },
];

// Attendance & Leave
const attendanceNav: NavItem[] = [
    {
        title: 'Mark Attendance',
        href: '/attendance/mark',
        icon: ClipboardList,
        permission: 'mark-attendance',
    },
    {
        title: 'Attendance Report',
        href: '/attendance/reports',
        icon: BarChart3,
        permission: 'view-attendance-reports',
    },
    {
        title: 'Leave Requests',
        href: '/leave-requests',
        icon: Calendar,
        permission: 'view-leaves',
    },
];

// Examination
const examNav: NavItem[] = [
    {
        title: 'Exams',
        href: '/exams',
        icon: FileText,
        permission: 'view-exams',
    },
    {
        title: 'Exam Schedules',
        href: '/exams/schedules',
        icon: CalendarDays,
        permission: 'view-exams',
    },
    {
        title: 'Enter Results',
        href: '/exams/results',
        icon: ClipboardList,
        permission: 'enter-results',
    },
    {
        title: 'Report Cards',
        href: '/exams/report-cards',
        icon: BookOpen,
        permission: 'view-report-cards',
    },
];

// Finance
const financeNav: NavItem[] = [
    {
        title: 'Fee Structure',
        href: '/fees/structure',
        icon: CreditCard,
        permission: 'view-fees',
    },
    {
        title: 'Collect Fees',
        href: '/fees/collect',
        icon: CreditCard,
        permission: 'collect-fees',
    },
    {
        title: 'Fee Reports',
        href: '/fees/reports',
        icon: BarChart3,
        permission: 'view-fee-reports',
    },
];

// Communication
const communicationNav: NavItem[] = [
    {
        title: 'Notices',
        href: '/notices',
        icon: Bell,
        permission: 'view-notices',
    },
    {
        title: 'Messages',
        href: '/messages',
        icon: MessageSquare,
        permission: 'view-messages',
    },
    {
        title: 'Events',
        href: '/events',
        icon: Calendar,
        permission: 'view-events',
    },
];

// Additional Modules
const modulesNav: NavItem[] = [
    {
        title: 'Library',
        href: '/library',
        icon: Library,
        permission: 'view-library',
    },
    {
        title: 'Transport',
        href: '/transport',
        icon: Bus,
        permission: 'view-transport',
    },
    { title: 'Hostel', href: '/hostel', icon: Home, permission: 'view-hostel' },
    {
        title: 'Inventory',
        href: '/inventory',
        icon: Package,
        permission: 'view-inventory',
    },
];

// Settings
const settingsNav: NavItem[] = [
    {
        title: 'School Settings',
        href: '/settings/school',
        icon: Building2,
        permission: 'view-settings',
    },
    {
        title: 'Roles & Permissions',
        href: '/settings/roles',
        icon: Shield,
        permission: 'view-roles',
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
        permission: 'view-reports',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: 'https://docs.schoolsync.com',
        icon: BookOpen,
    },
];

// Helper function to filter nav items based on permissions
function filterNavByPermissions(
    items: NavItem[],
    permissions: string[],
): NavItem[] {
    return items.filter((item) => {
        if (!item.permission) return true;
        return permissions.includes(item.permission);
    });
}

// Check if user has a specific role
function hasRole(userRoles: string[], roleToCheck: string): boolean {
    return userRoles.includes(roleToCheck);
}

export function AppSidebar() {
    const { permissions = [], roles = [] } = usePage<SharedData>().props;
    const userRoles = roles;
    const userPermissions = permissions;

    const isSuperAdmin = hasRole(userRoles, 'super-admin');
    const isSchoolOwner = hasRole(userRoles, 'school-owner');
    const isPrincipal = hasRole(userRoles, 'principal');
    const isTeacher =
        hasRole(userRoles, 'teacher') || hasRole(userRoles, 'class-teacher');
    const isStudent = hasRole(userRoles, 'student');
    const isParent = hasRole(userRoles, 'parent');
    const isAccountant = hasRole(userRoles, 'accountant');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Dashboard - Everyone */}
                <NavMain
                    items={[
                        {
                            title: 'Dashboard',
                            href: '/dashboard',
                            icon: LayoutGrid,
                        },
                    ]}
                />

                {/* Super Admin Section */}
                {isSuperAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Platform Admin</SidebarGroupLabel>
                        <NavMain items={superAdminNav} />
                    </SidebarGroup>
                )}

                {/* Academic Section - Admin, Principal, Teachers */}
                {(isSuperAdmin ||
                    isSchoolOwner ||
                    isPrincipal ||
                    isTeacher) && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Academics</SidebarGroupLabel>
                            <NavMain
                                items={filterNavByPermissions(
                                    academicNav,
                                    userPermissions,
                                )}
                            />
                        </SidebarGroup>
                    )}

                {/* People Management */}
                {!isStudent && !isParent && (
                    <SidebarGroup>
                        <SidebarGroupLabel>People</SidebarGroupLabel>
                        <NavMain
                            items={filterNavByPermissions(
                                peopleNav,
                                userPermissions,
                            )}
                        />
                    </SidebarGroup>
                )}

                {/* Attendance - Teachers, Admin */}
                {(isTeacher ||
                    isPrincipal ||
                    isSchoolOwner ||
                    isSuperAdmin) && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Attendance</SidebarGroupLabel>
                            <NavMain
                                items={filterNavByPermissions(
                                    attendanceNav,
                                    userPermissions,
                                )}
                            />
                        </SidebarGroup>
                    )}

                {/* Exams Section */}
                {!isAccountant && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Examinations</SidebarGroupLabel>
                        <NavMain
                            items={filterNavByPermissions(
                                examNav,
                                userPermissions,
                            )}
                        />
                    </SidebarGroup>
                )}

                {/* Finance - Admin, Accountant */}
                {(isAccountant ||
                    isSchoolOwner ||
                    isPrincipal ||
                    isSuperAdmin ||
                    isParent) && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Finance</SidebarGroupLabel>
                            <NavMain
                                items={filterNavByPermissions(
                                    financeNav,
                                    userPermissions,
                                )}
                            />
                        </SidebarGroup>
                    )}

                {/* Communication - Everyone */}
                <SidebarGroup>
                    <SidebarGroupLabel>Communication</SidebarGroupLabel>
                    <NavMain
                        items={filterNavByPermissions(
                            communicationNav,
                            userPermissions,
                        )}
                    />
                </SidebarGroup>

                {/* Additional Modules - Admin */}
                {(isSchoolOwner || isPrincipal || isSuperAdmin) && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Modules</SidebarGroupLabel>
                        <NavMain
                            items={filterNavByPermissions(
                                modulesNav,
                                userPermissions,
                            )}
                        />
                    </SidebarGroup>
                )}

                {/* Settings - Admin */}
                {(isSchoolOwner || isPrincipal || isSuperAdmin) && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Settings</SidebarGroupLabel>
                        <NavMain
                            items={filterNavByPermissions(
                                settingsNav,
                                userPermissions,
                            )}
                        />
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
