# 🛠️ SchoolSync Developer Guide

Welcome to the SchoolSync development documentation. This guide explains the architecture, directory structure, and coding standards used in this project.

## 🏗️ Architecture Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 18 + TypeScript
- **State/Routing**: Inertia.js 2.0
- **Multi-Tenancy**: Stancl/Tenancy (Domain-based)
- **Styling**: Tailwind CSS / Vanilla CSS
- **Components**: Radix UI + Lucide Icons
- **Database**: PostgreSQL/MySQL (Production) / SQLite (Development)

---

## 📁 Directory Structure Highlights

### Backend (`app/`)
- `Http/Controllers/Admin/`: Contains Super Admin controllers (Schools, Users, Subscriptions, Settings).
- `Models/`: Eloquent models with multi-tenancy traits (`forTenant`).
- `Traits/`: Shared logic (e.g., `SuperAdminAuthorize` trait for permission checks).

### Frontend (`resources/js/`)
- `pages/admin/`: Super Admin management interface.
- `pages/students/`, `pages/teachers/`: School-level views.
- `components/ui/`: Reusable Radix/Tailwind components.
- `layouts/`: `AppLayout` (Sidebar + Header) and `GuestLayout`.

---

## 🎖️ Super Admin Implementation

The Super Admin module provides platform-wide management.

### Key Controllers:
1. `SchoolController`: Manages tenants, branding, and status.
2. `UserController`: Global directory of all platform users.
3. `SubscriptionController`: Plan upgrades and expiry tracking.
4. `SettingsController`: SMTP, Features, and Security policies.

### Branding Engine:
School branding is managed via `primary_color` and `secondary_color` on the `Tenant` model. The `AppLayout` dynamically injects these colors as CSS variables.

---

## 🚀 Adding New Features

### 1. Backend Route
Add administrative routes to `routes/web.php` under the `admin` prefix. Ensure they are protected by the `isSuperAdmin()` check.

### 2. Controller
Create a controller in `app/Http/Controllers/Admin/`. Always call `$this->authorizeSuperAdmin()` in the constructor or methods.

### 3. Inertia Page
Place React components in `resources/js/pages/`. Use TypeScript interfaces for props defined in `resources/js/types/index.d.ts`.

---

## 🎨 UI Guidelines

- **Icons**: Use `Lucide React`.
- **Colors**: Use Tailwind's semantic colors (blue-500, emerald-500) for consistency.
- **Gradients**: Use `bg-gradient-to-br` for cards to maintain the premium aesthetic.
- **Feedback**: Always use toast notifications or validation error messages for form submissions.

---

## 🔐 Security Protocols

- **Tenant Isolation**: Use the `forTenant($id)` scope on models to prevent cross-school data leaks.
- **Role Checks**: Use `$user->hasRole('super-admin')` for platform operations.
- **Encryption**: sensitive data (API keys, SMTP passwords) are handled via environment variables or encrypted storage.

---

## 📞 Technical Support

- **Lead Developer**: 3s-Soft
- **System Version**: v0.2.1
- **Repo**: [GitHub](https://github.com/shauncuier/schoolmanagement)
