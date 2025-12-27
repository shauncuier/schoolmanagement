# 🛠️ Project Issue Backlog (Next Steps)

This document contains a structured list of issues and features to be implemented in the next development cycle, categorized by priority and module.

## 🔴 High Priority: Financial & HR

### 1. [FEATURE] Fee Management & Billing System
- **Objective**: Implement a multi-tenant fee structure for schools.
- **Tasks**:
    - [ ] Create `FeeCategory` and `FeeStructure` models.
    - [ ] Build UI for School Admins to define admission, monthly, and exam fees.
    - [ ] Implement automated invoice generation for students.
    - [ ] Create a Payment History dashboard for parents.
    - [ ] Integrate a basic payment verification workflow (Cash/Bank Transfer).

### 2. [FEATURE] HR & Comprehensive Staff Management
- **Objective**: Expand the teacher model into a full HR system.
- **Tasks**:
    - [ ] Add salary structure mapping for staff members.
    - [ ] Implement staff attendance tracking (separate from student attendance).
    - [ ] Build a "Leave Request" workflow with Admin approval.
    - [ ] Generate monthly payroll reports.

---

## 🟡 Medium Priority: Communication & Academic Depth

### 3. [FEATURE] Communication System (Notices & SMS)
- **Objective**: Centralize school-to-parent communication.
- **Tasks**:
    - [ ] Implement a "Circulars" module with file attachments.
    - [ ] Add support for "Notice Board" alerts on the student/parent dashboard.
    - [ ] Integrate an SMS Gateway provider (e.g., Twilio or local provider).
    - [ ] Build a search/filter interface for archived notices.

### 4. [FEATURE] Timetable & Scheduling
- **Objective**: Automate class scheduling.
- **Tasks**:
    - [ ] Build a drag-and-drop timetable builder for School Admins.
    - [ ] Create a "Daily Schedule" view for Teachers and Students.
    - [ ] Implement conflict detection for rooms/teachers.

### 5. [FEATURE] Interactive Discussion & Collaboration Flow
- **Objective**: Enable seamless communication between teachers, students, and parents.
- **Tasks**:
    - [ ] **Class Discussion Boards**: Create a dedicated board for each section where teachers can post topics and students can comment.
    - [ ] **Mentions & Replies**: Implement `@mentions` and threaded replies for organized conversations.
    - [ ] **Private Messaging**: Secure one-to-one messaging between Parents and Teachers.
    - [ ] **System-wide Forum**: A "Staff Only" discussion area for school-wide coordination.
    - [ ] **Live Notifications**: Integration with Pusher/Websockets for real-time reply alerts.
    - [ ] **Moderation Tools**: Allow admins to hide or archive inappropriate content.

---

## 🟢 Low Priority: Support Modules

### 5. [FEATURE] Library Management
- **Objective**: Track book inventory and issuance.
- **Tasks**:
    - [ ] Create `Book` and `IssueLog` models.
    - [ ] Build a barcode/ISBN scanner interface.
    - [ ] Implement overdue fine calculation.

### 6. [FEATURE] Transport & Vehicle Tracking
- **Objective**: Manage school bus routes and student assignments.
- **Tasks**:
    - [ ] Define routes, vehicles, and drivers.
    - [ ] Map students to specific transport routes.
    - [ ] Track vehicle maintenance and fuel logs.

---

## 🔧 Infrastructure & UX Improvements

### 7. [ENHANCEMENT] Multi-language (i18n) Support
- **Issue**: The application is currently hardcoded in English.
- **Requirement**: Use `react-i18next` or similar to support Bengali and other regional languages.

### 8. [ENHANCEMENT] RTL (Right-to-Left) Layout support
- **Issue**: Support for languages like Arabic/Urdu if the platform expands globally.
- **Requirement**: Implement Tailwind `rtl` utilities.

---

> [!TIP]
> You can copy these task lists directly into GitHub Issues to track development progress with your team.
