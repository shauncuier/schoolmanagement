# 🇧🇩 Bangladesh Market Roadmap — School Management System

Sequenced, build-one-at-a-time plan to turn the current generic ERP skeleton into a
Bangladesh-first SaaS. Order follows the impact-vs-effort matrix: quick wins first,
moat features next, differentiators last.

> Strategy in one line: the moat is the **localization rail** (SMS + MFS payment +
> Bangla + board compliance), and the money is in **transactions** (SMS markup,
> payment commission), not the SaaS fee.

---

## How we work

- **One feature per branch + PR.** Branch name `feat/<slug>`.
- Every feature ships with: migration(s), service class, controller, routes (permission-gated),
  Inertia page(s), **Pest tests**, and an entry flipped to ✅ here.
- Quality gate before merge: `./vendor/bin/pint`, `composer test`, `npm run types`, `npm run lint`, `npm run build`.
- Multi-tenancy rule (see `memory/tenancy-architecture-gotcha`): resolve tenant via
  `$user->tenant`, never the `tenant()` helper. Gate routes with `permission:` / `role:` middleware.
- Provider credentials (SMS/MFS) live **per tenant** in `tenants.settings` JSON (encrypted),
  with platform defaults in `config/services.php` + `.env`.

Legend: ⬜ todo · 🔄 in progress · ✅ done

---

## Phase 1 — Quick wins (top-left quadrant)

### 1.1 ✅ Masking SMS rail  *(matrix #1)*
Foundational. Attendance alerts, results, fee dues, notices all ride this.

> Shipped: `SmsService` (segment/cost calc for GSM + Bangla Unicode, BD number
> normalisation/validation, template rendering, bulk send), swappable driver
> contract + `LogDriver` (dev/fallback), reuses `notification_templates` /
> `notification_logs` (+ SMS columns), `communication/sms` console (compose,
> history, provider settings, test send), permission-gated routes, 17 Pest tests.
> Next: add a real provider driver (SSL Wireless) behind the same contract.

- **BD context:** parents judge schools by SMS. Use masking/branded SMS aggregators
  (SSL Wireless, Boomcast, REVE, Twenty4, BulkSMSBD). Unicode (Bangla) = 70 chars/segment.
- **DB:**
  - `sms_templates` (tenant_id, key, name, body, language, vars, is_active)
  - `sms_logs` (tenant_id, to, body, provider, segments, cost, status, provider_msg_id, sent_by, sent_at)
  - tenant settings: `sms.provider`, `sms.sender_id`, encrypted `sms.api_key/secret`, `sms.balance_alert`
- **Backend:** `app/Services/Sms/SmsGateway` interface + drivers (`SslWirelessDriver`, `LogDriver` for dev);
  `SmsService` (render template → send → log → count segments/cost). Queue jobs (`SendSmsJob`).
- **Routes/UI:** `school-settings` → SMS tab (provider config, sender id, test send);
  `communication/sms` (compose, template CRUD, logs, balance). Gate `permission:send-notifications`.
- **Security:** encrypt API secrets, rate-limit send, validate recipients are own-tenant, mask key in responses.
- **Tests:** template render, segment/cost calc, tenant isolation of logs, driver swappable, fake driver in tests.
- **Acceptance:** admin configures provider, sends a test SMS, sees it logged with segment count.

### 1.2 ✅ Result publish by roll  *(matrix #5)*
- **Goal:** publish exam results; parent/student fetch by roll+exam on a public tenant page; optional SMS push.

> Shipped: reused `exams.is_published` / `result_published_at` + `report_cards`
> (no new table needed). `ResultService` publish/unpublish (flips exam + report
> cards, optional guardian SMS push via 1.1) and `lookup()` (returns null on any
> miss). Admin console `exams/results` (publish/unpublish, notify toggle) gated
> by `publish-results`; public `results/{tenant:slug}` page throttled (30/min),
> tenant-scoped by slug, generic not-found (no enumeration leak). 14 Pest tests.

### 1.3 ✅ Finish exam & marks-entry module  *(matrix #8)*
Tables existed; UI/logic were missing. Produces the report cards 1.2 publishes.

> Shipped: Exam/ExamType/GradingSystem/GradePoint/ExamSchedule/ExamResult/
> ReportCard models. `GradingService` (auto-creates the BD GPA-5 scale,
> percentage→grade/point). `ExamGradingService` — bulk marks entry with auto
> grade/point, and report-card generation (totals, %, GPA, overall grade,
> rank per class+section, **BD fail rule: any subject fail → GPA 0.00/F**).
> ExamController (CRUD + generate), ExamScheduleController, MarksController
> (entry grid). Routes gated view/create/edit-exams, enter/manage-results.
> Pages: exams index/create/edit/show + marks grid. 13 Pest tests.

### 1.4 ✅ Audit logs + security hardening  *(matrix #13)*

> Shipped: append-only `activity_logs` table + `ActivityLog` model +
> `ActivityLogger` service. Auth events (login/logout/failed — password never
> stored) logged via `AppServiceProvider` listeners; role create/update/delete,
> result publish/unpublish and settings changes logged in their controllers.
> Tenant-scoped audit viewer at `/activity-logs` (gated `manage-settings`).
> **Closed the big hole:** added `permission:view-*` middleware to the previously
> auth-only resource routes (students, classes, sections, subjects, teachers,
> guardians, staff, admissions, attendance, timetable, fees) so non-privileged
> users (e.g. students) can no longer reach admin modules. Login throttle already
> existed (Fortify, 5/min). 10 Pest tests.
>
> Deferred (follow-ups): finer write-vs-read gating per action, 2FA enablement
> UI (columns ready), GDPR-style data export/delete.

---

## Phase 2 — Moat features (high impact)

### 2.1 ⬜ MFS fee payment — bKash / Nagad / Rocket  *(matrix #2)*
Biggest revenue lever. Reconciliation is the #1 admin pain.

- **BD context:** bKash + Nagad dominate; cards rare. Optionally aggregate via SSLCOMMERZ/aamarPay (one integration, many methods).
- **DB:** extend `fee_payments` (gateway, gateway_txn_id, gateway_status, payload); `payment_intents`
  (tenant_id, allocation_id, amount, gateway, status, validation_id, expires_at).
- **Backend:** `app/Services/Payment/PaymentGateway` interface + drivers (`BkashDriver`, `NagadDriver`, `SslcommerzDriver`);
  create-intent → redirect/checkout → callback/IPN verify → mark allocation paid → receipt + SMS.
- **Routes:** `fees/pay/{allocation}` (create intent), `payments/callback/{gateway}` (signed, no-auth IPN, verify server-side).
- **Security:** verify signatures/server-side amount, idempotent callbacks, never trust client amount, encrypt creds per tenant,
  reconcile job for stuck intents.
- **Tests:** intent lifecycle, callback verify (valid/forged), idempotency, partial/duplicate payment, allocation status transitions.
- **Monetization:** convenience-fee / commission config per tenant.

### 2.2 ⬜ Bangla (i18n) + bilingual report cards  *(matrix #3)*
- **Frontend:** i18n (e.g. `i18next`), Bangla/English toggle, persist per user; Bangla fonts (Noto Sans Bengali) bundled.
- **Backend:** Laravel `lang/bn`, localized validation + emails/SMS.
- **Report cards:** server-side PDF (DomPDF/`spatie/laravel-pdf`), bilingual template, school logo/branding, GPA + grades, signatures.
- **Tests:** locale switch, PDF renders for a student with marks, Bangla glyphs present.

### 2.3 ⬜ Online admission + MFS admission fee  *(matrix #4)*
Builds on existing admissions module + 2.1 payment.

- **Flow:** public apply form → pay admission fee (MFS) → application enters review → approve creates Student + user + fee allocation.
- **UI:** branded public admission page per tenant, payment step, application status lookup.
- **Tests:** apply→pay→approve→student created, unpaid stays pending, tenant scoping.

---

## Phase 3 — Retention & depth

### 3.1 ⬜ Parent/Student mobile app (Android-first)  *(matrix #6)*
- **Approach:** API layer (Sanctum tokens) + React Native / Expo (or PWA first to save effort).
- **Scope:** attendance, results, fee dues + pay, notices, messages, timetable.
- **Pre-req:** SMS-OTP / mobile-number login (email rare in BD).
- **Tests:** API auth, tenant scoping, push/notification fan-out.

### 3.2 ⬜ Accounting + MPO payroll  *(matrix #9)*
- **Scope:** income/expense ledger, fee→income posting, staff salary structures, MPO vs non-MPO, payslip PDF, basic P&L.
- **BD:** MPO (govt salary subsidy) reporting, BANBEIS/EIIN exports.
- **Tests:** ledger balance, payroll run, payslip, exports.

---

## Phase 4 — Operational modules

- 4.1 ⬜ Timetable + substitution  *(matrix #10)*
- 4.2 ⬜ Library / Transport (+GPS option) / Hostel  *(matrix #11)*
- 4.3 ⬜ Biometric / RFID attendance (ZKTeco devices common in BD)  *(matrix #12)*
- 4.4 ⬜ ID card + QR generator, canteen/tiffin wallet, multi-branch chains

---

## Phase 5 — Differentiators (future)

- 5.1 ⬜ OMR MCQ sheet scanning (coaching centers)  *(matrix #14)*
- 5.2 ⬜ AI dropout prediction + Bangla chatbot  *(matrix #15)*
- 5.3 ⬜ Online class / LMS-lite + WhatsApp channel  *(matrix #16)*
- 5.4 ⬜ Madrasah variant — Hifz/Quran memorization tracking, Arabic, separate calendar

---

## Segment notes (who we sell to)

- **Primary fit:** private English/Bangla-medium K-12, kindergartens, coaching centers.
- **Variants later:** govt/MPO (compliance-heavy, price-sensitive), madrasah (Hifz module).

## Revenue model reminder

Software = cheap hook (even freemium). Real margin = **SMS markup + MFS payment commission**.
Build 1.1 and 2.1 well — they fund everything else and competitors can't copy them with UI alone.

---

**Status:** Phase 1 ✅ COMPLETE — 1.1 (SMS rail), 1.2 (Result publish), 1.3 (Exam & marks entry), 1.4 (Audit + security). Next: Phase 2 — 2.1 (MFS payment) or 2.2 (Bangla + report-card PDF).
**Last updated:** 2026-06-15
