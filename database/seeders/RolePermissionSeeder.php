<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions
        $permissions = $this->getPermissions();

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Define roles with their permissions
        $roles = $this->getRoles();

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            
            if ($rolePermissions === '*') {
                // Super admin gets all permissions
                $role->syncPermissions(Permission::all());
            } else {
                $role->syncPermissions($rolePermissions);
            }
        }
    }

    /**
     * Get all permissions grouped by module.
     */
    private function getPermissions(): array
    {
        return [
            // Dashboard
            'view-dashboard',
            'view-analytics',
            
            // Tenant/School Management (Super Admin)
            'manage-tenants',
            'view-tenants',
            'create-tenants',
            'edit-tenants',
            'delete-tenants',
            
            // User Management
            'manage-users',
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',
            'impersonate-users',
            
            // Role & Permission Management
            'manage-roles',
            'view-roles',
            'create-roles',
            'edit-roles',
            'delete-roles',
            
            // Academic Year Management
            'manage-academic-years',
            'view-academic-years',
            'create-academic-years',
            'edit-academic-years',
            'delete-academic-years',
            
            // Class Management
            'manage-classes',
            'view-classes',
            'create-classes',
            'edit-classes',
            'delete-classes',
            
            // Section Management
            'manage-sections',
            'view-sections',
            'create-sections',
            'edit-sections',
            'delete-sections',
            
            // Subject Management
            'manage-subjects',
            'view-subjects',
            'create-subjects',
            'edit-subjects',
            'delete-subjects',
            
            // Student Management
            'manage-students',
            'view-students',
            'create-students',
            'edit-students',
            'delete-students',
            'promote-students',
            'transfer-students',
            'view-student-details',
            
            // Teacher Management
            'manage-teachers',
            'view-teachers',
            'create-teachers',
            'edit-teachers',
            'delete-teachers',
            'assign-subjects',
            
            // Parent/Guardian Management
            'manage-guardians',
            'view-guardians',
            'create-guardians',
            'edit-guardians',
            'delete-guardians',
            
            // Attendance Management
            'manage-attendance',
            'view-attendance',
            'mark-attendance',
            'edit-attendance',
            'view-attendance-reports',
            
            // Leave Management
            'manage-leaves',
            'view-leaves',
            'apply-leave',
            'approve-leave',
            'reject-leave',
            
            // Examination Management
            'manage-exams',
            'view-exams',
            'create-exams',
            'edit-exams',
            'delete-exams',
            'schedule-exams',
            
            // Results & Grades
            'manage-results',
            'view-results',
            'enter-results',
            'edit-results',
            'publish-results',
            'view-report-cards',
            'generate-report-cards',
            
            // Fee Management
            'manage-fees',
            'view-fees',
            'create-fee-structure',
            'edit-fee-structure',
            'delete-fee-structure',
            'collect-fees',
            'view-fee-reports',
            'process-refunds',
            
            // Timetable Management
            'manage-timetable',
            'view-timetable',
            'create-timetable',
            'edit-timetable',
            'delete-timetable',
            
            // Notice & Communication
            'manage-notices',
            'view-notices',
            'create-notices',
            'edit-notices',
            'delete-notices',
            'send-notifications',
            
            // Messages
            'manage-messages',
            'view-messages',
            'send-messages',
            
            // Events & Calendar
            'manage-events',
            'view-events',
            'create-events',
            'edit-events',
            'delete-events',
            
            // Reports
            'view-reports',
            'generate-reports',
            'export-reports',
            
            // Settings
            'manage-settings',
            'view-settings',
            'edit-settings',
            
            // Library (Future)
            'manage-library',
            'view-library',
            
            // Transport (Future)
            'manage-transport',
            'view-transport',
            
            // Hostel (Future)
            'manage-hostel',
            'view-hostel',
            
            // Inventory (Future)
            'manage-inventory',
            'view-inventory',
        ];
    }

    /**
     * Get all roles with their permissions.
     */
    private function getRoles(): array
    {
        return [
            // Platform Level Roles
            'super-admin' => '*', // All permissions
            
            // School Level Roles
            'school-owner' => [
                'view-dashboard', 'view-analytics',
                'manage-users', 'view-users', 'create-users', 'edit-users', 'delete-users',
                'manage-roles', 'view-roles', 'create-roles', 'edit-roles',
                'manage-academic-years', 'view-academic-years', 'create-academic-years', 'edit-academic-years',
                'manage-classes', 'view-classes', 'create-classes', 'edit-classes', 'delete-classes',
                'manage-sections', 'view-sections', 'create-sections', 'edit-sections', 'delete-sections',
                'manage-subjects', 'view-subjects', 'create-subjects', 'edit-subjects', 'delete-subjects',
                'manage-students', 'view-students', 'create-students', 'edit-students', 'view-student-details',
                'manage-teachers', 'view-teachers', 'create-teachers', 'edit-teachers', 'assign-subjects',
                'manage-guardians', 'view-guardians', 'create-guardians', 'edit-guardians',
                'manage-exams', 'view-exams', 'create-exams', 'edit-exams', 'delete-exams',
                'manage-results', 'view-results', 'publish-results', 'view-report-cards', 'generate-report-cards',
                'manage-fees', 'view-fees', 'create-fee-structure', 'edit-fee-structure', 'view-fee-reports',
                'manage-notices', 'view-notices', 'create-notices', 'edit-notices', 'send-notifications',
                'view-reports', 'generate-reports', 'export-reports',
                'manage-settings', 'view-settings', 'edit-settings',
            ],
            
            'principal' => [
                'view-dashboard', 'view-analytics',
                'view-users', 'create-users', 'edit-users',
                'view-roles',
                'manage-academic-years', 'view-academic-years', 'create-academic-years', 'edit-academic-years',
                'manage-classes', 'view-classes', 'create-classes', 'edit-classes',
                'manage-sections', 'view-sections', 'create-sections', 'edit-sections',
                'manage-subjects', 'view-subjects', 'create-subjects', 'edit-subjects',
                'manage-students', 'view-students', 'create-students', 'edit-students', 'promote-students', 'view-student-details',
                'manage-teachers', 'view-teachers', 'create-teachers', 'edit-teachers', 'assign-subjects',
                'manage-guardians', 'view-guardians', 'create-guardians', 'edit-guardians',
                'manage-attendance', 'view-attendance', 'view-attendance-reports',
                'manage-leaves', 'view-leaves', 'approve-leave', 'reject-leave',
                'manage-exams', 'view-exams', 'create-exams', 'edit-exams', 'schedule-exams',
                'manage-results', 'view-results', 'publish-results', 'view-report-cards', 'generate-report-cards',
                'view-fees', 'view-fee-reports',
                'manage-timetable', 'view-timetable', 'create-timetable', 'edit-timetable',
                'manage-notices', 'view-notices', 'create-notices', 'edit-notices', 'send-notifications',
                'manage-events', 'view-events', 'create-events', 'edit-events',
                'view-reports', 'generate-reports', 'export-reports',
                'view-settings',
            ],
            
            'vice-principal' => [
                'view-dashboard', 'view-analytics',
                'view-users',
                'view-academic-years',
                'view-classes', 'create-classes', 'edit-classes',
                'view-sections', 'create-sections', 'edit-sections',
                'view-subjects', 'create-subjects', 'edit-subjects',
                'view-students', 'create-students', 'edit-students', 'view-student-details',
                'view-teachers', 'assign-subjects',
                'view-guardians',
                'view-attendance', 'view-attendance-reports',
                'view-leaves', 'approve-leave', 'reject-leave',
                'view-exams', 'create-exams', 'edit-exams', 'schedule-exams',
                'view-results', 'view-report-cards',
                'view-timetable', 'create-timetable', 'edit-timetable',
                'view-notices', 'create-notices', 'edit-notices',
                'view-events', 'create-events', 'edit-events',
                'view-reports',
            ],
            
            'admin-officer' => [
                'view-dashboard',
                'view-users', 'create-users', 'edit-users',
                'view-academic-years',
                'view-classes',
                'view-sections',
                'view-subjects',
                'manage-students', 'view-students', 'create-students', 'edit-students', 'view-student-details',
                'view-teachers',
                'manage-guardians', 'view-guardians', 'create-guardians', 'edit-guardians',
                'view-attendance',
                'view-exams',
                'view-timetable',
                'view-notices', 'create-notices',
                'view-events', 'create-events',
            ],
            
            'academic-coordinator' => [
                'view-dashboard',
                'view-academic-years',
                'manage-classes', 'view-classes', 'create-classes', 'edit-classes',
                'manage-sections', 'view-sections', 'create-sections', 'edit-sections',
                'manage-subjects', 'view-subjects', 'create-subjects', 'edit-subjects',
                'view-students', 'view-student-details',
                'view-teachers', 'assign-subjects',
                'manage-exams', 'view-exams', 'create-exams', 'edit-exams', 'schedule-exams',
                'view-results', 'enter-results', 'edit-results',
                'manage-timetable', 'view-timetable', 'create-timetable', 'edit-timetable',
            ],
            
            'teacher' => [
                'view-dashboard',
                'view-classes',
                'view-sections',
                'view-subjects',
                'view-students', 'view-student-details',
                'manage-attendance', 'view-attendance', 'mark-attendance',
                'apply-leave', 'view-leaves',
                'view-exams',
                'view-results', 'enter-results',
                'view-timetable',
                'view-notices',
                'view-messages', 'send-messages',
                'view-events',
            ],
            
            'class-teacher' => [
                'view-dashboard',
                'view-classes',
                'view-sections',
                'view-subjects',
                'view-students', 'view-student-details', 'edit-students',
                'manage-attendance', 'view-attendance', 'mark-attendance', 'view-attendance-reports',
                'apply-leave', 'view-leaves',
                'view-exams',
                'view-results', 'enter-results', 'view-report-cards',
                'view-timetable',
                'view-notices', 'create-notices',
                'view-messages', 'send-messages',
                'view-events',
            ],
            
            'student' => [
                'view-dashboard',
                'view-attendance',
                'view-exams',
                'view-results', 'view-report-cards',
                'view-fees',
                'view-timetable',
                'view-notices',
                'view-messages', 'send-messages',
                'view-events',
                'view-library',
            ],
            
            'parent' => [
                'view-dashboard',
                'view-students', 'view-student-details',
                'view-attendance',
                'view-exams',
                'view-results', 'view-report-cards',
                'view-fees',
                'view-timetable',
                'view-notices',
                'view-messages', 'send-messages',
                'view-events',
            ],
            
            'accountant' => [
                'view-dashboard',
                'view-students',
                'manage-fees', 'view-fees', 'create-fee-structure', 'edit-fee-structure', 'collect-fees', 'view-fee-reports', 'process-refunds',
                'view-reports', 'generate-reports', 'export-reports',
            ],
            
            'librarian' => [
                'view-dashboard',
                'view-students',
                'view-teachers',
                'manage-library', 'view-library',
            ],
            
            'transport-manager' => [
                'view-dashboard',
                'view-students',
                'manage-transport', 'view-transport',
            ],
            
            'hostel-manager' => [
                'view-dashboard',
                'view-students',
                'manage-hostel', 'view-hostel',
            ],
            
            'hr-manager' => [
                'view-dashboard',
                'manage-users', 'view-users', 'create-users', 'edit-users',
                'manage-teachers', 'view-teachers', 'create-teachers', 'edit-teachers',
                'view-attendance',
                'manage-leaves', 'view-leaves', 'approve-leave', 'reject-leave',
            ],
            
            'it-support' => [
                'view-dashboard',
                'view-users',
                'view-settings',
            ],
        ];
    }
}
