# 🏫 School Management System

![Version](https://img.shields.io/badge/version-v0.0.2-blue.svg)
![Laravel](https://img.shields.io/badge/Laravel-12-red.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A comprehensive, enterprise-grade **Multi-Tenant School Management System** built with modern technologies. This SaaS-ready platform enables educational institutions to manage all aspects of school operations from a single, unified interface.

---

## 🌟 Features Overview

### Core Modules
- **🎓 Student Management** - Admissions, profiles, promotions, transfers, alumni
- **👨‍🏫 Teacher Management** - Staff profiles, assignments, performance tracking
- **📚 Academic Management** - Classes, sections, subjects, curriculum
- **📅 Attendance System** - Manual, QR, biometric, RFID integration ready
- **📝 Examination & Grading** - Multiple exam types, GPA/CGPA, report cards
- **💰 Fee Management** - Fee structures, payments, discounts, receipts
- **📆 Timetable Management** - Period slots, teacher allocation, room scheduling
- **📢 Communication System** - Notices, messages, SMS/Email notifications
- **👨‍👩‍👧 Parent Portal** - Performance tracking, attendance, fee status
- **🔐 Role-Based Access Control** - Granular permissions per user role

### Enterprise Features
- **🏢 Multi-Tenancy** - Single installation, multiple schools
- **🌐 Multi-Language (i18n)** - Support for multiple languages
- **🌙 Dark/Light Mode** - Theme switching capability
- **📱 Mobile Responsive** - Works on all devices
- **🔒 Security** - JWT authentication, 2FA ready, audit logs

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend Framework** | Laravel 12 |
| **Frontend Framework** | React 18 + TypeScript |
| **Full-Stack Bridge** | Inertia.js 2.0 |
| **Authentication** | Laravel Fortify |
| **Authorization** | Spatie Laravel Permission |
| **Multi-Tenancy** | Stancl/Tenancy |
| **Database** | SQLite (dev) / PostgreSQL/MySQL (prod) |
| **API Security** | Laravel Sanctum |
| **Build Tool** | Vite |
| **Testing** | Pest PHP |

---

## 📋 User Roles & Stakeholders

### Core Users
| Role | Description |
|------|-------------|
| **Super Admin** | Platform owner with full system access |
| **School Owner** | School-level administrative access |
| **Principal** | School head with management capabilities |
| **Vice Principal** | Deputy school head |
| **Academic Coordinator** | Curriculum and academic management |
| **Admin Officer** | Administrative operations |
| **Teacher** | Subject teaching and class management |
| **Class Teacher** | Designated class coordinator |
| **Student** | Learning and academic activities |
| **Parent/Guardian** | Child's progress monitoring |
| **Accountant** | Financial management |
| **Librarian** | Library operations |
| **HR Manager** | Staff and payroll management |
| **IT Support** | Technical administration |

### External Integrations
- Payment Gateways (Stripe, bKash, etc.)
- SMS/Email Providers
- Biometric Devices
- Government Portals
- Third-party LMS/ERP

---

## 🗄️ Database Schema

### Core Tables

```
📁 Authentication & Users
├── users
├── tenants
├── domains
├── roles
├── permissions
└── model_has_roles

📁 Academic Structure
├── academic_years
├── classes
├── sections
├── subjects
├── class_subjects
├── teachers
└── teacher_subject_assignments

📁 Student Management
├── guardians
├── students
├── student_guardian
└── student_class_history

📁 Attendance System
├── attendances
├── teacher_attendances
└── leave_requests

📁 Examination & Assessment
├── exam_types
├── grading_systems
├── grade_points
├── exams
├── exam_schedules
├── exam_results
└── report_cards

📁 Fee Management
├── fee_categories
├── fee_structures
├── discounts
├── student_fee_allocations
├── fee_payments
└── fee_refunds

📁 Timetable & Communication
├── timetable_slots
├── timetables
├── notices
├── messages
├── notification_templates
├── notification_logs
└── events
```

---

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer 2.x
- Node.js 18+ & npm
- Database (SQLite/MySQL/PostgreSQL)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/schoolmanagement.git
cd schoolmanagement

# Install dependencies
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate
php artisan db:seed

# Build assets
npm run build

# Start development server
composer dev
```

### Development Commands

```bash
# Start all development services (server + queue + vite)
composer dev

# Run tests
composer test

# Format code
./vendor/bin/pint

# Run with SSR
composer dev:ssr
```

---

## 📁 Project Structure

```
schoolmanagement/
├── app/
│   ├── Actions/          # Business logic actions
│   ├── Http/
│   │   ├── Controllers/  # Request handlers
│   │   ├── Middleware/   # Request middleware
│   │   └── Requests/     # Form request validation
│   ├── Models/           # Eloquent models
│   └── Providers/        # Service providers
├── bootstrap/            # Framework bootstrap
├── config/               # Configuration files
├── database/
│   ├── factories/        # Model factories
│   ├── migrations/       # Database migrations
│   └── seeders/          # Database seeders
├── public/               # Public assets
├── resources/
│   ├── css/              # Stylesheets
│   ├── js/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Page layouts
│   │   ├── pages/        # Inertia pages
│   │   └── types/        # TypeScript types
│   └── views/            # Blade templates
├── routes/
│   ├── web.php           # Web routes
│   ├── tenant.php        # Multi-tenant routes
│   └── settings.php      # Settings routes
├── storage/              # File storage
└── tests/                # Test files
```

---

## 🔐 Security Features

- ✅ Password Hashing (Bcrypt/Argon2)
- ✅ JWT Authentication with Refresh Tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Permission-Based Access Control (PBAC)
- ✅ CSRF Protection
- ✅ XSS Prevention
- ✅ SQL Injection Protection
- 🔄 Two-Factor Authentication (Ready)
- 🔄 Audit Logs (Planned)
- 🔄 IP/Device Tracking (Planned)

---

## 🌐 Multi-Tenancy Architecture

This system uses **Domain-Based Multi-Tenancy** powered by Stancl/Tenancy:

- **Central Domain**: Main application (super admin)
- **Tenant Domains**: Individual school subdomains
- **Data Isolation**: Each tenant's data is isolated
- **Custom Branding**: Per-school themes and logos

```
example.com           → Central Application
school1.example.com   → Tenant: School 1
school2.example.com   → Tenant: School 2
```

---

## 📊 Reporting & Analytics

### Available Reports
- Student Performance Analytics
- Attendance Trends & Statistics
- Financial Reports (Collections, Dues)
- Teacher Performance Metrics
- Class-wise Comparison

### Export Formats
- PDF
- Excel (.xlsx)
- CSV

---

## 🔄 API Integration Ready

The system is designed to integrate with:

| Integration Type | Examples |
|-----------------|----------|
| Payment Gateways | Stripe, PayPal, bKash, Razorpay |
| SMS Providers | Twilio, Nexmo, Local SMS APIs |
| Email Services | SMTP, Mailgun, SendGrid |
| Biometric Devices | ZKTeco, Hikvision |
| GPS Tracking | For transport management |
| Government Portals | Education board data sync |

---

## 📱 Client Applications (Planned)

| Platform | Status | Description |
|----------|--------|-------------|
| Web App (Admin/Staff) | ✅ Active | Main administrative interface |
| Mobile App - Student | 🔄 Planned | Student portal for learning |
| Mobile App - Parent | 🔄 Planned | Parent monitoring app |
| Mobile App - Teacher | 🔄 Planned | Teacher management app |
| Public Website | 🔄 Planned | Admission, notices |

---

## 🧪 Testing

```bash
# Run all tests
composer test

# Run specific test file
./vendor/bin/pest tests/Feature/ExampleTest.php

# Run with coverage
./vendor/bin/pest --coverage
```

---

## 📈 Deployment Options

| Model | Description |
|-------|-------------|
| **Cloud SaaS** | Multi-tenant cloud deployment |
| **On-Premise** | Single-tenant local installation |
| **Hybrid** | Mix of cloud and local |

### Recommended Infrastructure
- Docker containerization
- CI/CD pipelines (GitHub Actions)
- Auto-scaling capable
- Load balancer ready
- Blue-green deployment support

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support, please contact:
- 📧 Email: support@example.com
- 📖 Documentation: [docs.example.com](https://docs.example.com)
- 💬 Discord: [Community Server](https://discord.gg/example)

---

## 🗺️ Roadmap & Architecture

- [System Architecture](SYSTEM_ARCHITECTURE.md) - Full technical specification and feature list
- [Implementation Progress](IMPLEMENTATION_CHECKLIST.md) - Detailed development progress and upcoming features

---

<p align="center">
  Developed by <a href="https://3s-soft.com/">3s-Soft</a><br>
  Made with ❤️ for Education
</p>
