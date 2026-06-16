# 📘 SchoolSync — Project Plan, Status & Issues

> **Single source of truth** for where the project is, what's planned, and what's open.
> This file replaces the previous scattered planning docs (ROADMAP_BANGLADESH,
> ROADMAP_ISSUES, FULL_PROJECT_ISSUES, IMPLEMENTATION_CHECKLIST).
>
> Companion docs: [README](README.md) (setup) · [CHANGELOG](CHANGELOG.md) (releases) ·
> [SYSTEM_ARCHITECTURE](SYSTEM_ARCHITECTURE.md) (long-form vision/spec) ·
> [DEVELOPER_GUIDE](DEVELOPER_GUIDE.md) · [docs/](docs/) (user guides).

**Version:** v1.5.0 · **Updated:** 2026-06-16 · **Tests:** 141 passing · **CI:** green · **DB:** MySQL (prod) / SQLite (dev+tests)

---

## 1. Overview

Multi-tenant School Management System (Laravel 13 · React 19 · Inertia 2 · Spatie permissions · Stancl tenancy), tailored for the **Bangladesh education market** (masking SMS, GPA-5 grading, result lookup by roll, MFS-ready fees).

**Code inventory:** 37 controllers · 31 models · 13 services · 18 migrations · 23 page groups · 136 automated tests.

**Strategy:** the moat is the localization rail (SMS + results + MFS payment); the revenue is in transactions (SMS markup, payment commission), not the SaaS fee. Build the rail first, polish later.

---

## 2. Status

Legend: ✅ done · 🔄 partial · ⏳ planned · 🔮 future

| Module | Status | % | Notes |
|--------|:--:|:--:|-------|
| Authentication & Authorization | ✅ | 100 | Fortify (session, 2FA-ready), Spatie RBAC, `permission:`/`role:` route gating, login throttle |
| Multi-tenancy | ✅ | 100 | `tenant_id`-scoped single DB; super-admin platform-wide; per-school branding |
| Platform / Super Admin | ✅ | 100 | Schools, users, subscriptions, system settings, cache |
| Academic structure | ✅ | 90 | Academic years, classes, sections, subjects (class-subject mapping UI pending) |
| Student management | 🔄 | 70 | CRUD, admissions workflow, guardians, fee auto-allocation (no ID card, promotion, bulk import, doc upload) |
| Teacher & staff | 🔄 | 55 | CRUD + assignment (no payroll/MPO, performance reviews) |
| Attendance | ✅ | 90 | Daily + bulk marking, leave requests (no analytics, biometric) |
| Examination & grading | ✅ | 90 | Exam CRUD, scheduling, marks grid, **GPA-5 auto-grading**, ranking, report-card generation (no PDF, bulk upload, practical, re-eval) |
| Result publishing | ✅ | 100 | Publish/unpublish, **public lookup by roll** (throttled), optional SMS |
| Fee management | 🔄 | 80 | Categories, structures, allocations, payments, receipts, reports; **MFS online payment built but disabled (cash-only)**; discounts/refunds/late-fee UI pending |
| SMS / Communication | 🔄 | 55 | **Masking SMS rail**, templates, console, **notices/announcements** with SMS broadcast (no email, push, internal messaging) |
| Audit & Security | ✅ | 90 | Activity log (auth/role/result/settings), IP capture, route gating, throttle |
| Timetable | ⏳ | 15 | Slots + basic store; no full builder |
| Reporting & analytics | 🔄 | 40 | Dashboard stats, fee reports (no perf/attendance analytics, exports) |
| Parent portal | ⏳ | 20 | Read access via permissions; no dedicated portal/app |
| Library / Transport / Hostel / Inventory | ⏳ | 0 | Not started |
| i18n / Bangla UI | ⏳ | 0 | Not started |
| Mobile apps | 🔮 | 0 | Future |

---

## 3. Plan (Roadmap)

Sequenced by impact vs effort — localization rail first, polish later. One feature per branch + PR; every feature ships with tests; bump version on release.

### Phase 1 — Localization rail ✅ COMPLETE
- ✅ **1.1 Masking SMS rail** — segment/cost calc (GSM-7 + Bangla), templates, bulk send, console.
- ✅ **1.2 Result publish by roll** — public throttled lookup + optional SMS.
- ✅ **1.3 Exam & marks entry** — GPA-5 grading engine, ranking, report cards.
- ✅ **1.4 Audit + route-permission hardening.**

### Phase 2 — Moat features 🔄 IN PROGRESS
- 🔄 **2.1 MFS fee payment** — provider-agnostic gateway + sandbox done & tested; **currently disabled (cash-only)**. *Next: real bKash/Nagad driver + re-enable.*
- 🔄 **2.2 Bangla (i18n) UI + report-card PDF** — ✅ board-style report-card PDF (DomPDF) shipped; ⏳ Bangla i18n UI + bilingual PDF (needs headless-Chrome renderer) pending.
- ⏳ **2.3 Online admission + MFS admission fee** — extends admissions + payment.

### Phase 3 — Retention & depth ⏳
- ⏳ **3.1 Parent/Student mobile app** (Android-first; SMS-OTP login).
- ⏳ **3.2 Accounting + MPO payroll** (income/expense, payslips, MPO/BANBEIS exports).

### Phase 4 — Operational modules ⏳
- ⏳ Timetable + substitution · Library / Transport (+GPS) / Hostel · Biometric/RFID attendance · ID card + QR.

### Phase 5 — Differentiators 🔮
- 🔮 OMR MCQ scanning · AI dropout prediction + Bangla chatbot · LMS-lite + WhatsApp · Madrasah (Hifz) variant.

---

## 4. Issues & Backlog

Concrete open items (priority order). Pull these into GitHub issues as needed.

### High
- [ ] **Real MFS gateway driver** (bKash/Nagad sandbox API) behind the existing `PaymentGateway` contract; re-enable `PAYMENT_ONLINE_ENABLED`.
- [x] **Report-card PDF** ✅ — board-style PDF (DomPDF) with school branding, gated download. *Follow-up: Bangla/bilingual rendering needs a headless-Chrome renderer; add a UI download link.*
- [x] **Notices/announcements UI** ✅ — CRUD with audience targeting + optional SMS broadcast to the audience. *Events table still has no UI.*
- [ ] **Fee depth** — discount, refund, and late-fee calculation UI (tables exist).

### Medium
- [ ] **Bangla (i18n)** UI + localized validation/SMS.
- [ ] **Granular fee/route permissions** — current gating is module-level `view-*`; add write-vs-read (`create/edit/delete`) per action.
- [ ] **Student tools** — bulk CSV import, ID-card generator, promotion/transfer wizard, document upload.
- [ ] **Class–subject assignment** UI (mapping table planned).
- [ ] **Email & push notifications** (SMS rail exists; add channels).
- [ ] **Reporting** — attendance/performance analytics + PDF/Excel/CSV export.

### Low / Tech debt
- [ ] **2FA enablement UI** (columns + Fortify ready) and GDPR-style data export/delete.
- [ ] **GitHub Actions**: bump `actions/checkout`/`setup-node` off deprecated Node 20.
- [ ] **Tenancy note**: `domains` table present but domain routing unused; never use the `tenant()` helper on web routes — resolve via `$user->tenant` (see DEVELOPER_GUIDE).
- [ ] **Real SMS provider driver** (SSL Wireless, etc.) behind the `SmsDriver` contract.

### Known constraints
- Remote MySQL requires the dev machine's IP whitelisted in cPanel → Remote MySQL.
- Online payments intentionally **off** (cash-only) until a real gateway lands.

---

## 5. How we work

- Branch per feature (`feat/<slug>`), PR into `main`, CI must pass.
- Quality gate before merge: `composer test` · `./vendor/bin/pint` · `npm run types` · `npm run lint` · `npm run build`.
- Tenancy: resolve tenant via `$user->tenant_id`; gate routes with `permission:`/`role:` middleware.
- Versioning: SemVer in git tags + [CHANGELOG](CHANGELOG.md) + `package.json`; tagging `v*` triggers the release workflow.
- **Project skills** in `.claude/skills/` encode these workflows for Claude Code: `quality-gate` (pre-merge checks), `new-feature` (scaffold a feature the project way), `release` (SemVer bump + tag), `db-reseed` (rebuild demo data).

---

**Maintained by [3s-Soft](https://3s-soft.com/).**
