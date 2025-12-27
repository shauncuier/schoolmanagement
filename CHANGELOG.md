# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
