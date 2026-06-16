# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2026-06-16

### Added
- **Notices & announcements** — create, edit, and publish notices with audience targeting (all / students / teachers / parents / staff / a specific class) and an optional **SMS broadcast** to that audience through the masking SMS rail.

### Security
- Notice management is permission-gated (`view-notices` to read, `create/edit/manage-notices` to write); records are tenant-scoped, and the SMS broadcast only fires when a notice transitions to published.

### Changed
- Test suite expanded to 147 passing tests.

---

## [1.5.0] - 2026-06-16

### Added
- **Report-card PDF** — a board-style, printable report card generated server-side with DomPDF (school branding, subject-wise marks, GPA/grade/rank, pass-fail, signatures), built from the existing report-card and exam-result data.

### Security
- The report-card download is permission-gated: results staff may preview any card, while a student/parent may download only their own card and only once it is published; cross-tenant access is blocked.

### Changed
- Added `barryvdh/laravel-dompdf`. Test suite expanded to 141 passing tests.

---

## [1.4.0] - 2026-06-16

### Changed
- **Upgraded to Laravel 13** (`laravel/framework` ^13.0, `laravel/tinker` ^3.0); `composer update` refreshed the first-party stack and brought PHPUnit 12 / Pest 4 transitively. No application code changes were required — the only high-impact 13.x change (the `VerifyCsrfToken` → `PreventRequestForgery` middleware rename) is not referenced here. All 136 tests pass on 13.15.0.
- Applied Laravel Pint 1.29 formatting across the codebase (line endings, import ordering, imported class references) — formatting only.

---

## [1.3.0] - 2026-06-16

### Added
#### 💳 MFS Fee Payment (sandbox-first)
- **Online fee payment** via mobile financial services — the platform's biggest revenue lever.
- **Provider-agnostic gateway** contract with a `SandboxGateway` that completes instantly (no credentials needed); real bKash/Nagad/Rocket drivers plug in via `config/payment.php`.
- **`payment_intents`** lifecycle table; `PaymentService` creates intents (amount capped at the outstanding due), handles callbacks **idempotently**, and settles using the **server-side amount only** — creating the payment, updating the allocation, and sending an SMS receipt.
- Payer-facing **pay** and **status** screens, gated to the fee owner or staff with `collect-fees`; a public, throttled callback/IPN endpoint.

### Security
- Payment settlement ignores client-supplied amounts (tamper-proof); callbacks are idempotent; intents expire after a configurable TTL; payer authorization restricts users to their own fees.

### Changed
- Test suite expanded to 135 passing tests.

---

## [1.2.1] - 2026-06-16

### Fixed
- **MySQL fresh install**: Ordered the tenancy migrations (`tenants`, `domains`) to run before the `users` table, which holds a foreign key to `tenants`. The previous order only worked on SQLite (which ignores foreign-key timing); MySQL rejected it with errno 150, breaking fresh installs on the production database.

## [1.2.0] - 2026-06-16

### Added
#### 📱 Masking SMS Rail (Bangladesh)
- **SMS Service**: Provider-agnostic engine with GSM-7 / Bangla-Unicode segment and cost calculation, Bangladeshi number normalisation + validation, `{{variable}}` template rendering, and deduplicated bulk send.
- **Swappable Drivers**: `SmsDriver` contract with a development `LogDriver`; real masking providers plug in via `config/sms.php`. Per-tenant provider config with encrypted secrets.
- **SMS Console**: Compose with a live segment counter, delivery history, provider settings, and a test-send tool.

#### 📊 Result Publishing & Public Lookup
- **Publishing**: Publish / unpublish exam results, with optional guardian SMS notification (rides the SMS rail).
- **Public Lookup**: Per-school result lookup by roll number — throttled, tenant-scoped by slug, with no result enumeration leak.

#### 📝 Examination & Marks Entry
- **Exam Workflow**: Exam CRUD, per-subject scheduling, and a keyboard-friendly marks-entry grid.
- **Grading Engine**: Auto-provisioned Bangladesh GPA-5 letter scale; automatic grade / grade-point computation.
- **Report Cards**: Consolidated generation with class + section ranking and the Bangladesh rule that failing any subject forces GPA 0.00 / fail.

#### 🛡️ Roles, Settings & Fees
- **Role Management UI**: Create / edit / delete roles and permissions (platform super-admin only — roles are global).
- **School Settings**: Per-school general, branding and academic settings with logo / favicon upload.
- **Auto Fee Allocation**: Fee structures allocate to eligible students automatically on creation.

#### 🔍 Audit Trail
- **Activity Log**: Append-only log of authentication events, role / permission changes, result publishing and settings changes.
- **Viewer**: Tenant-scoped audit viewer at `/activity-logs`.

### Security
- Restricted global role management to the platform super-admin, preventing cross-tenant privilege escalation.
- Gated school settings behind the `manage-settings` permission and fixed tenant resolution (the feature previously always returned 403).
- Added `permission:view-*` middleware to previously auth-only resource routes (students, classes, sections, subjects, teachers, guardians, staff, admissions, attendance, timetable, fees) so non-privileged users can no longer reach admin modules.
- Audited failed sign-in attempts (password never stored); login throttling provided by Fortify.

### Changed
- Added the Bangladesh market roadmap (`ROADMAP_BANGLADESH.md`).
- Expanded the automated test suite to 118 passing tests.

### Fixed
- Fee-allocation due date now falls back to the current date when a structure leaves it blank (avoids a NOT NULL failure).
- Resolved Inertia v2 payload typing errors, a missing icon import, and an always-true notification default.

---

## [1.1.0] - 2025-12-28

### Added
#### 🎓 Admission Workflow
- **Public Application Form**: Multi-step online admission form for prospective families with real-time validation.
- **Admission Management Hub**: Centralized dashboard for school staff to track, review, and process applications.
- **Conversion Engine**: Automated logic to transform approved applications into active student and user accounts.
- **Model Standard**: Integrated `AdmissionApplication` model with full lifecycle support.

#### 🛡️ Multi-Tenancy Hardening
- **Trait-Based Security**: Implemented `TenantAware` trait and `TenantScope` for platform-wide strict data isolation.
- **Architectural Cleanup**: Refactored core models to eliminate manual scoping:
    - `Student`, `Guardian`, `AcademicYear`, `SchoolClass`, `Section`.
- **Automatic Scoping**: Enforced `tenant_id` injection and filtering at the Eloquent level.

### Changed
- **Navigation**: Integrated Admissions into the people management sidebar.
- **Code Health**: Fixed Inertia route linting errors by transitioning to relative API paths.

---

## [1.0.0] - 2025-12-28

### Added
#### 📖 Internal Documentation System
- **Public Docs**: Implemented a dedicated `/docs` route accessible to all users.
- **Markdown Support**: serving guides dynamically from `.md` files in the `docs/` directory.
- **Advanced Viewer**: Created a premium React-based documentation viewer with:
    - **Live Search**: Filter guides by title or content instantly.
    - **Keyboard Shortcuts**: Added `CMD+K` (or `CTRL+K`) to focus the search input.
    - **Code Copying**: One-click "Copy" button on all code blocks with hover effects.
    - **Responsive Design**: Mobile-friendly navigation with an overlay menu.
- **Styling**: Integrated `@tailwindcss/typography` for professional-grade markdown rendering.

#### 🚀 Super Admin - Platform Management
- **School Dashboard**: Comprehensive management of all platform schools (tenants).
- **Statistics**: Real-time analytics for total, active, pending, and suspended schools.
- **Branding Engine**: Live color picker for school-specific primary/secondary branding with preview.
- **Subscription Hub**: Manage multi-tier plans (Free, Basic, Standard, Premium) and expiry controls.
- **User Directory**: Centralized management of every user across all tenants with recovery (Soft Delete) support.
- **System Hub**: UI-based configuration for SMTP, Security Policies (Password complexity, lockout), and Feature Toggles.

#### 📊 Platform Dashboard
- **Unified Analytics**: Platform-wide stats for Revenue, Users, and School registrations.
- **Adaptive UI**: Seamless dashboard switching between Super Admin and School-level views.

#### 🔧 UI/UX Improvements
- **Sidebar Refinement**: Renamed "Platform Admin" to **"Super Admin"** to improve clarity and reduce word repetition.
- **Smart Navigation**: Updated header and footer documentation links to point to the new internal system.
- **Logo Transition**: Improved consistency across branding logos.

### Changed
- **Version Reset**: Transitioned from beta versioning (v0.2.x) to a clean, community-standard **v1.0.0** release.
- **Tags**: Deleted all previous pre-release tags to start fresh.

---

## [0.2.0] - 2025-12-27
### Added
- Attendance & Exams Module implementation.

## [0.0.2] - 2025-12-26
### Added
- Initial project structure with Multi-Tenancy support.
