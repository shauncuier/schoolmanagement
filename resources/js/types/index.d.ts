import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string;
    children?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    tenant?: Tenant;
    permissions?: string[];
    roles?: string[];
    [key: string]: unknown;
}

export interface User {
    id: number;
    tenant_id: string | null;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: 'active' | 'inactive' | 'suspended';
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    last_login_at?: string;
    roles?: Role[];
    permissions?: string[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    logo?: string;
    primary_color: string;
    secondary_color: string;
    theme: 'light' | 'dark' | 'system';
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    subscription_plan: string;
    subscription_ends_at?: string;
    settings?: Record<string, unknown>;
}

// Academic Types
export interface AcademicYear {
    id: number;
    tenant_id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    status: 'active' | 'completed' | 'upcoming';
}

export interface SchoolClass {
    id: number;
    tenant_id: string;
    name: string;
    numeric_name?: string;
    description?: string;
    order: number;
    is_active: boolean;
    sections?: Section[];
}

export interface Section {
    id: number;
    tenant_id: string;
    class_id: number;
    academic_year_id: number;
    name: string;
    capacity: number;
    class_teacher_id?: number;
    room_number?: string;
    is_active: boolean;
    school_class?: SchoolClass;
    class_teacher?: User;
    students_count?: number;
}

export interface Subject {
    id: number;
    tenant_id: string;
    name: string;
    code?: string;
    description?: string;
    type: 'theory' | 'practical' | 'both';
    is_optional: boolean;
    is_active: boolean;
}

export interface Student {
    id: number;
    tenant_id: string;
    user_id: number;
    admission_no?: string;
    roll_number?: string;
    class_id?: number;
    section_id?: number;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    blood_group?: string;
    status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'dropout';
    user?: User;
    school_class?: SchoolClass;
    section?: Section;
}

export interface Teacher {
    id: number;
    tenant_id: string;
    user_id: number;
    employee_id?: string;
    designation?: string;
    department?: string;
    joining_date?: string;
    employment_type: 'full-time' | 'part-time' | 'contract' | 'substitute';
    is_active: boolean;
    user?: User;
}

export interface Guardian {
    id: number;
    tenant_id: string;
    user_id: number;
    occupation?: string;
    relation_type: 'father' | 'mother' | 'guardian' | 'other';
    is_primary_contact: boolean;
    user?: User;
    students?: Student[];
}

// Dashboard Stats
export interface SchoolDashboardStats {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    total_sections: number;
    attendance_today: {
        present: number;
        absent: number;
        late: number;
        total: number;
        percentage: number;
    };
    fee_collection: {
        collected: number;
        pending: number;
        total: number;
    };
    recent_notices: Notice[];
    upcoming_events: Event[];
}

export interface SuperAdminDashboardStats {
    is_super_admin: boolean;
    total_schools: number;
    total_users: number;
    active_subscriptions: number;
    monthly_revenue: number;
    recent_schools: Array<{
        id: string;
        name: string;
        subscription_plan: string;
        created_at: string;
    }>;
}

export type DashboardStats = SchoolDashboardStats | SuperAdminDashboardStats;

export interface Notice {
    id: number;
    title: string;
    content: string;
    type:
    | 'notice'
    | 'announcement'
    | 'circular'
    | 'event'
    | 'holiday'
    | 'urgent';
    publish_date: string;
    created_by?: User;
}

export interface Event {
    id: number;
    title: string;
    description?: string;
    type: string;
    start_date: string;
    end_date?: string;
    location?: string;
    color: string;
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
