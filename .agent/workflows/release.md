---
description: How to release a new version of SchoolSync
---

When the user asks to "release" or "push a new version", follow these steps:

1. **Verify State**: Ensure all current changes are committed to `main`.
2. **Check Version**: Determine the next version number based on [Semantic Versioning](https://semver.org/).
   - Current version can be found in `package.json`, `README.md`, or `PROJECT_PLAN.md`.
3. **Update Documentation**:
   - Update `README.md` badges and `package.json` version.
   - Update `CHANGELOG.md` and `PROJECT_PLAN.md` with the new version and date.
4. **Commit Documentation**:
   ```bash
   git add README.md package.json CHANGELOG.md PROJECT_PLAN.md
   git commit -m "chore(release): bump version to vX.Y.Z"
   ```
5. **Tag the Release**:
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   ```
6. **Push Everything**:
   ```bash
   git push origin main
   git push origin vX.Y.Z
   ```
7. **Verify Release Notes**: The GitHub Action will categorize commits and set the release type:
   - **Stable**: For tags like `v1.0.0`, `v2.1.0`.
   - **Beta**: For tags starting with `v0.` (e.g., `v0.1.0`).
   - Categorization based on:
     - `feat` -> 🚀 Features
     - `fix` -> 🐛 Bug Fixes
     - `docs` -> 📚 Documentation
     - `chore/refactor` -> 🔧 Maintenance
