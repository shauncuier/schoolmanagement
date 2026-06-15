---
name: new-feature
description: Build a new SchoolSync feature the project way — branch, backend + tests first, lean frontend, quality gate, commit, merge, push, version bump. Use when implementing a roadmap item or any non-trivial feature.
---

# New feature workflow

Follow the conventions this project already uses. Read `PROJECT_PLAN.md` first to pick the next item.

## 1. Branch
`git checkout -b feat/<slug>` (one feature per branch).

## 2. Backend first (it's the testable core)
- **Migrations**: tenancy tables already run before `users` (FK ordering matters on MySQL — keep new tenant-FK tables after `tenants`). Reuse existing tables/columns before adding new ones.
- **Services** in `app/Services/<Domain>/` hold the logic. For external integrations use the **provider-agnostic driver pattern** (see `Sms/` and `Payment/`): a `Contracts/<X>` interface + a `Log`/`Sandbox` driver registered in a `config/<x>.php` `drivers` map, so the whole pipeline is testable with **no real credentials**.
- **Controllers** are thin. Resolve the tenant via `$request->user()->tenant` / `$user->tenant_id` — **never the Stancl `tenant()` helper** (it's null on web routes). Add a per-record `authorizeForTenant()` check (super-admin has `tenant_id === null` and bypasses).
- **Routes**: gate with `permission:`/`role:` middleware. Validate cross-tenant FKs with `Rule::exists(...)->where('tenant_id', $tenantId)`.

## 3. Tests (Pest, in `tests/Feature/`)
Cover: core logic + boundaries, **tenant isolation**, **authorization** (allowed role passes, lacking role 403s), and idempotency/integrity for money/state. Run `php artisan test tests/Feature/<File>.php`.

## 4. Frontend (lean)
Inertia + React 19 pages in `resources/js/pages/`. Reuse `@/components/ui/*`. Match existing page structure (AppLayout, breadcrumbs, Card/Table/Button). Keep it minimal but functional.

## 5. Quality gate
Run the `quality-gate` skill. All green required.

## 6. Ship
- Update `PROJECT_PLAN.md` status/issues for the item.
- Commit on the branch; `git checkout main && git merge --ff-only feat/<slug> && git branch -d feat/<slug>`.
- If it's a user-facing feature, run the `release` skill (minor bump). Otherwise just `git push origin main`.
- **Always push after committing** (project rule). Never force-push `main`.
