# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-12-28

### Added
#### 🚀 Super Admin - Schools (Tenants) Management
- **School Dashboard**: Created a comprehensive list view for all schools in the system.
- **Statistics**: Summary cards for total, active, pending, and suspended schools.
- **Advanced Filtering**: Search by name/email/slug and filter by status or subscription plan.
- **School Creation**: New form to register schools, including automatic slug generation and domain association.
- **Branding Engine**: Implemented a color picker for Primary and Secondary branding colors with a **live preview** interface.
- **Detailed Profiles**: "Show" page displaying school-specific stats (User/Student/Teacher counts) and recent activity.
- **Status Control**: Platform-level ability to suspend, activate, or set schools to pending.

#### 👥 Super Admin - All Users Management
- **Cross-Tenant View**: A centralized directory of every user in the entire system, regardless of which school they belong to.
- **User Insights**: Detailed profiles showing login history, IP logs, and verification status.
- **Global Search**: Search users across the entire platform by name or email.
- **Role & School Management**: Ability for Super Admins to reassign users to different schools or change their roles globally.
- **Recovery Tools**: Implemented support for **Soft Deletes**, allowing admins to view, restore, or permanently purge deleted users.

#### 💳 Super Admin - Subscriptions Management
- **Subscription Overview**: Dedicated dashboard to track platform revenue and plan distribution.
- **Plan Management**: Ability to upgrade or downgrade a school's plan (Free, Basic, Standard, Premium).
- **Expiry Controls**: Tools to set specific expiry dates or extend subscriptions by a set number of days.
- **Status Tracking**: Visual indicators for "Expiring Soon" (within 30 days) and "Expired" accounts.
- **Plan Comparison**: Integrated plan feature list and pricing reference within the dashboard.

#### ⚙️ Super Admin - System Settings
- **Configuration Hub**: A multi-tabbed interface for managing the entire platform's behavior.
- **General Settings**: Manage platform branding (name/description), localizations (timezone/language), and date/time formats.
- **Email Configuration**: Full SMTP/Mail driver management via UI, stored in a custom system settings layer.
- **Feature Toggles**: Centralized switches for User Registration, Social Login, 2FA, API Access, and Notifications.
- **Security Policy**: Manage session lifetimes, lockout durations, and **Password Complexity rules** (Uppercase, Numbers, Symbols).
- **Maintenance Mode**: One-click toggle to put the entire platform into maintenance mode.
- **System Info**: Real-time display of environment details including PHP/Laravel versions and server limits.
- **Utility**: Added "Clear System Cache" button for rapid troubleshooting.

#### 📊 Super Admin - Dashboard
- **Platform Analytics**: Real-time stats for Total Schools, Total Users, Active Subscriptions, and Monthly Revenue.
- **Recent Activity**: Tracking list for the latest school registrations.
- **Adaptive UI**: Dashboard switching logic between school-level and platform-level views based on user role.
- **Admin Quick Actions**: Direct access to critical management tools from the dashboard.

#### 🔧 UI Components & Infrastructure
- **New Component**: Added `Tabs` UI component using Radix UI primitives.
- **Navigation**: Updated `app-sidebar.tsx` with restricted "Platform Admin" section for Super Admins.
- **Routes**: Registered **25 new administrative routes** covering all CRUD and utility actions.

### Fixed
- **Build Process**: Resolved TypeScript configuration nuances by properly installing `@radix-ui/react-tabs` and ensuring Vite build compatibility.

---

## [0.2.0] - 2025-12-27
### Added
- Attendance & Exams Module implementation.

## [0.0.2] - 2025-12-26
### Added
- Initial project structure with Multi-Tenancy support.
