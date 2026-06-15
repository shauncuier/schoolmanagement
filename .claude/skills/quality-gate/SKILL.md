---
name: quality-gate
description: Run the full pre-merge quality gate for SchoolSync (PHP tests + format, TypeScript, lint, build) and report pass/fail. Use before committing or merging any change.
---

# Quality gate

Run every check that CI runs, in this order. Stop and report on the first failure.

## Backend
1. `./vendor/bin/pint` — format PHP (Laravel preset). Re-run with `--test` to confirm clean.
2. `php artisan test` — full Pest suite on SQLite in-memory (configured in `phpunit.xml`). Tests call `$this->withoutVite()` via the base `TestCase`, so **no `npm run build` is needed** for Inertia-render tests.

## Frontend
3. `php artisan wayfinder:generate --with-form` — regenerate the git-ignored `@/routes` and `@/actions` helpers. **Required before `npm run types` on a fresh checkout** (the `--with-form` flag matches `vite.config.ts` `formVariants: true`).
4. `npm run types` — `tsc --noEmit`.
5. `npm run lint` — ESLint over the whole project (CI runs `eslint .`, not single files).
6. `npm run build` — production assets.

## Notes
- On Windows use the PowerShell tool for `php`/`npm`/`vendor/bin/*`; `php` is not on the bash PATH.
- `npm run lint` is `eslint . --fix`; it may modify files — review the diff.
- Report a concise pass/fail summary with the failing output, not a wall of logs.
