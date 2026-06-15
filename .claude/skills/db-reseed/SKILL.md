---
name: db-reseed
description: Rebuild the SchoolSync database with realistic demo data and verify it. Use to reset local data or after schema changes.
---

# Reseed the database

`php artisan migrate:fresh --seed` drops everything and rebuilds: schema +
roles/permissions + demo users + a working demo school (students, teachers,
guardians, fees, a published exam with marks and ranked report cards, SMS
templates, attendance).

## Run
```
php artisan migrate:fresh --seed
```
Over a **remote MySQL** this is slow (thousands of round-trips, a few minutes) —
run it in the background and watch for completion.

## Seeder chain (`database/seeders/DatabaseSeeder.php`)
`RolePermissionSeeder` → super-admin + school-owner users → `DemoUserSeeder`
(demo-school tenant + role users) → `SampleDataSeeder` (academic structure +
people) → `DemoOperationsSeeder` (fees, exams/results, SMS, attendance).

## Verify (read-only)
```
php artisan db:show --counts
```
Expect roughly: 74 users, 30 students, 90 fee allocations, 63 payments,
90 exam results, 30 published report cards, attendance + SMS rows.

## Notes
- Demo fee payments are recorded as **cash** (online MFS payments are disabled — see `PAYMENT_ONLINE_ENABLED`).
- Demo login: `admin@schoolsync.com` (super admin) / `school@demo.com` (school owner), password `password`.
- On Windows, avoid PHP `$variables` inside `tinker --execute "..."` from PowerShell — it eats `$`. Prefer `db:show` or write a temporary script.
