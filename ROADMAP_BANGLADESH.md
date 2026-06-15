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

### 1.1 ⬜ Masking SMS rail  *(matrix #1 — START HERE)*
Foundational. Attendance alerts, results, fee dues, notices all ride this.

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

### 1.2 ⬜ Result publish by roll  *(matrix #5)*
- **Goal:** publish exam results; parent/student fetch by roll+exam on a public tenant page; optional SMS push.
- **Depends on:** 1.1 (SMS) + exam results data.
- **DB:** `result_publications` (tenant_id, exam_id, published_at, published_by, is_public).
- **Backend:** `ResultService::publish(exam)`; public lookup endpoint (throttled, no auth) keyed by EIIN/slug.
- **UI:** public `results/lookup` page (roll + reg + exam → GPA, grade, subject marks); admin publish toggle.
- **Security:** throttle lookups, no enumeration leak (generic "not found"), public route is tenant-scoped by domain/slug.
- **Tests:** publish flow, lookup hit/miss, unpublished hidden, throttle.

### 1.3 ⬜ Finish exam & marks-entry module  *(matrix #8)*
Tables exist; UI/logic missing. Unlocks 1.2 and report cards.

- **Backend:** marks entry (subject-wise, bulk), auto grade/GPA from `grading_systems`+`grade_points`,
  rank calc per class/section, pass/fail rules.
- **UI:** exam create wizard, schedule, marks-entry grid (keyboard-friendly, low-bandwidth), result preview/publish.
- **BD:** GPA 5.00 scale, letter grades (A+ =5.0 … F), configurable per tenant (NCTB in flux — keep it data-driven).
- **Tests:** grade boundary calc, GPA, rank ties, bulk entry validation, tenant isolation.

### 1.4 ⬜ Audit logs + security hardening  *(matrix #13)*
- **DB:** `activity_logs` (tenant_id, user_id, action, subject_type/id, properties, ip, ua, created_at) — or `spatie/laravel-activitylog`.
- **Scope:** log auth events, role/permission changes, fee payments, result publish, settings changes.
- **Also:** add `permission:` middleware to the remaining resource routes (students/classes/fees/etc. — currently auth-only);
  add login throttle/lockout, 2FA enable (columns ready), data-export/delete (privacy).
- **Tests:** sensitive actions logged, log is tenant-scoped + read-only, route permission gates.

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

**Status:** Phase 1.1 (Masking SMS rail) is next.
**Last updated:** 2026-06-15
