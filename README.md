# 🏫 School Management System (SchoolSync)

![Version](https://img.shields.io/badge/version-v1.2.1-blue.svg)
![Laravel](https://img.shields.io/badge/Laravel-12-red.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tests](https://img.shields.io/badge/tests-118%20passing-success.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

A comprehensive, multi-tenant **School Management System** built with Laravel 12, React 19 and Inertia.js. It runs as a single SaaS installation serving many schools, and is being tailored for the **Bangladesh education market** — masking SMS, result lookup by roll number, GPA-5 grading, and MFS-ready fee collection.

> 📄 Release notes: [CHANGELOG.md](CHANGELOG.md) · 🗺️ Direction: [ROADMAP_BANGLADESH.md](ROADMAP_BANGLADESH.md) · 📋 Progress: [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)

---

## 🌟 Features

### ✅ Implemented

**Platform (Super Admin)**
- Cross-tenant school (tenant) management, registration, and per-school branding (colors, logo, favicon).
- Subscription plans (Free / Basic / Standard / Premium) with expiry and extension controls.
- Global user directory with soft-delete recovery; system settings (SMTP, security policy, feature toggles, cache).

**School operations**
- 🎓 **Student & guardian management** — admissions workflow, profiles, fee auto-allocation on enrolment.
- 👨‍🏫 **Teacher & staff management** and academic structure (academic years, classes, sections, subjects).
- 📅 **Attendance** — daily marking, bulk entry, leave requests.
- 📝 **Examinations & grading** — exam CRUD, per-subject scheduling, marks-entry grid, an auto-provisioned **Bangladesh GPA-5** scale, automatic grade/point calculation, and ranked report-card generation (fail-any-subject → GPA 0.00 rule).
- 📊 **Result publishing** — publish/unpublish results; **public lookup by roll number** (throttled, no enumeration leak) with optional guardian SMS.
- 💰 **Fee management** — categories, structures, allocations, payments, and receipts.
- 📱 **Masking SMS rail** — provider-agnostic engine with GSM-7/Bangla-Unicode segment & cost calculation, BD number validation, templates, bulk send, and a delivery-history console.
- 🔐 **Role-based access control** (Spatie) with per-route permission gating and a tenant-scoped **audit trail**.

### 🔄 Planned
Timetable polish, MFS payment (bKash/Nagad/Rocket), Bangla (i18n) UI + bilingual report-card PDF, parent/student mobile apps, library/transport/hostel, OMR scanning, and analytics. See the [roadmap](ROADMAP_BANGLADESH.md).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Laravel 12 (PHP 8.2+) |
| **Frontend** | React 19 + TypeScript 5.7 |
| **Full-stack bridge** | Inertia.js 2.1 + Laravel Wayfinder |
| **Authentication** | Laravel Fortify (session-based, 2FA-ready) |
| **Authorization** | Spatie Laravel Permission |
| **Multi-tenancy** | Stancl/Tenancy (tenant-scoped data isolation) |
| **API tokens** | Laravel Sanctum |
| **Database** | MySQL (prod) · SQLite (dev & tests) |
| **Build tool** | Vite |
| **Testing** | Pest 4 (118 feature/unit tests) |
| **CI/CD** | GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+ and Composer 2.x
- Node.js 18+ and npm
- A database (SQLite for local, MySQL/PostgreSQL for production)

### Installation

```bash
git clone https://github.com/shauncuier/schoolmanagement.git
cd schoolmanagement

# Dependencies
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database — creates schema and realistic demo data
php artisan migrate:fresh --seed

# Generate typed route/action helpers (Wayfinder), then build
php artisan wayfinder:generate --with-form
npm run build

# Run it (server + queue + vite)
composer dev
```

> SQLite is the default. For MySQL/PostgreSQL, set `DB_CONNECTION` and the `DB_*`
> values in `.env`, then run `php artisan migrate:fresh --seed`.

### 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@schoolsync.com` | `password` |
| School Owner | `school@demo.com` | `password` |
| Principal | `principal@demo.com` | `password` |
| Teacher | `teacher@demo.com` | `password` |
| Student | `student@demo.com` | `password` |
| Parent | `parent@demo.com` | `password` |
| Accountant | `accountant@demo.com` | `password` |

The seed builds a working demo school: 30 students, teachers, guardians, fee allocations + payments, a published exam with marks and ranked report cards, SMS templates, and attendance.

---

## 🧪 Development & Testing

```bash
composer dev                 # server + queue + vite
composer test                # full Pest suite (SQLite in-memory)
php artisan test             # same, directly

./vendor/bin/pint            # format PHP (Laravel Pint)
npm run types                # TypeScript check (run wayfinder:generate first on a fresh checkout)
npm run lint                 # ESLint
npm run build                # production assets
```

> The `@/routes` and `@/actions` imports are generated by Wayfinder and are
> git-ignored. On a fresh checkout run `php artisan wayfinder:generate --with-form`
> (or `npm run build`) before `npm run types`.

---

## 🔐 Security

- ✅ Password hashing (Bcrypt)
- ✅ Session authentication via Fortify; login throttling (5/min per email+IP)
- ✅ Role- and permission-based access control, with `permission:`/`role:` route gating
- ✅ Cross-tenant isolation (role management restricted to the platform super-admin)
- ✅ Audit trail (auth events, role/permission changes, result publishing, settings)
- ✅ CSRF protection, encrypted provider secrets
- 🔄 Two-factor authentication (columns + Fortify wiring ready)
- 🔄 GDPR-style data export/delete (planned)

---

## 🌐 Multi-Tenancy

Tenancy is keyed off the authenticated user's `tenant_id` — a single shared
database with per-tenant data isolation enforced through tenant scoping and
route gating. The platform **super-admin** (no tenant) operates across all
schools; every other user is bound to one school. Per-school branding (colors,
logo, favicon) and settings are stored on the tenant record.

> A `domains` table is present (Stancl/Tenancy) for future per-school domain
> routing; current routing is central with tenant resolved from the user.

---

## 🗄️ Database Schema (overview)

```
Auth & tenancy     users · tenants · domains · roles · permissions · activity_logs
Academic           academic_years · classes · sections · subjects · teachers
Students           students · guardians · student_guardian · student_class_history
Attendance         attendances · teacher_attendances · leave_requests
Examinations       exam_types · grading_systems · grade_points · exams ·
                   exam_schedules · exam_results · report_cards
Fees               fee_categories · fee_structures · discounts ·
                   student_fee_allocations · fee_payments · fee_refunds
Communication      notices · messages · notification_templates · notification_logs · events
Admissions         admission_applications
```

---

## 📁 Project Structure

```
app/
├── Http/Controllers/   # incl. Communication/ (SMS) and Exam/ (results, marks)
├── Models/
├── Services/           # FeeAllocation, ResultService, Sms/, Exam/ (grading), ActivityLogger
└── Providers/
database/
├── migrations/
├── seeders/            # DatabaseSeeder → SampleDataSeeder → DemoOperationsSeeder
└── factories/
resources/js/
├── components/ · hooks/ · layouts/ · pages/ · types/
routes/                 # web.php · tenant.php · settings.php
tests/Feature/          # 118 Pest tests
.github/workflows/      # ci.yml (tests + types + lint + build) · release.yml
```

---

## 📦 Versioning & Releases

Semantic Versioning, tracked in git tags, [CHANGELOG.md](CHANGELOG.md), and
`package.json`. Tagging `v*` triggers the release workflow. Current: **v1.2.1**.

---

## 🤝 Contributing

1. Branch from `main` (`git checkout -b feat/your-feature`).
2. Make the change with tests; run `composer test`, `./vendor/bin/pint`, `npm run types`, `npm run lint`, `npm run build`.
3. Open a pull request — CI must pass.

---

## 📄 License

Proprietary software owned by **3s-Soft**. See [LICENSE](LICENSE).

## 📞 Support
- 📧 support@3s-soft.com
- 🌐 [3s-soft.com](https://3s-soft.com)

<p align="center">Developed by <a href="https://3s-soft.com/">3s-Soft</a> · Made with ❤️ for Education</p>
