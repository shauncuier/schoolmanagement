---
name: release
description: Cut a SemVer release for SchoolSync — bump version in three places, tag, and push so the GitHub release workflow runs. Use after a feature (minor) or fix (patch) lands on main.
---

# Release

The project versions with **Semantic Versioning**, tracked in three files that must stay in sync. Pushing a `v*` tag triggers `.github/workflows/release.yml`.

## Pick the bump
- New backward-compatible feature → **minor** (`1.3.0 → 1.4.0`).
- Bug/security fix only → **patch** (`1.3.0 → 1.3.1`).
- Breaking change → **major**.

## Steps
1. Ensure `main` is clean and green (run the `quality-gate` skill).
2. Update all three:
   - `CHANGELOG.md` — add `## [x.y.z] - YYYY-MM-DD` at the top with `Added` / `Changed` / `Fixed` / `Security` subsections (Keep a Changelog format).
   - `package.json` — `"version": "x.y.z"`.
   - `PROJECT_PLAN.md` — header `Version:` line.
3. Commit:
   ```
   git add CHANGELOG.md package.json PROJECT_PLAN.md
   git commit -m "chore(release): vX.Y.Z"
   ```
4. Tag (annotated) and push with the tag:
   ```
   git tag -a vX.Y.Z -m "vX.Y.Z — <one-line summary>"
   git push origin main --follow-tags
   ```
5. Confirm CI is green and the GitHub release was created.

Commits/tags are authored as the repo's git user (Shaun) — do not add co-author trailers.
