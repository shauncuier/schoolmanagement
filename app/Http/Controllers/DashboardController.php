<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // If super admin without tenant, show platform stats
        if ($user->isSuperAdmin() && !$tenantId) {
            return $this->superAdminDashboard();
        }

        // Get school-level stats
        $stats = $this->getSchoolStats($tenantId);

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }

    /**
     * Get super admin platform statistics.
     */
    private function superAdminDashboard(): Response
    {
        // For now, return basic stats
        // TODO: Add tenant counts, revenue, etc.
        return Inertia::render('dashboard', [
            'stats' => [
                'is_super_admin' => true,
                'total_schools' => 0, // Tenant::count(),
                'total_users' => \App\Models\User::count(),
                'active_subscriptions' => 0,
                'monthly_revenue' => 0,
            ],
        ]);
    }

    /**
     * Get school-level statistics.
     */
    private function getSchoolStats(?string $tenantId): array
    {
        if (!$tenantId) {
            return $this->getEmptyStats();
        }

        $today = Carbon::today();

        // Get counts
        $totalStudents = Student::forTenant($tenantId)->active()->count();
        $totalTeachers = Teacher::forTenant($tenantId)->active()->count();
        $totalClasses = SchoolClass::forTenant($tenantId)->active()->count();
        $totalSections = Section::forTenant($tenantId)->active()->count();

        // Get today's attendance stats
        $todayAttendance = Attendance::forTenant($tenantId)
            ->forDate($today)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status IN ("present", "late") THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late
            ')
            ->first();

        $attendanceTotal = $todayAttendance->total ?? 0;
        $attendancePresent = $todayAttendance->present ?? 0;
        $attendancePercentage = $attendanceTotal > 0 
            ? round(($attendancePresent / $attendanceTotal) * 100, 1) 
            : 0;

        return [
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'total_classes' => $totalClasses,
            'total_sections' => $totalSections,
            'attendance_today' => [
                'present' => (int) ($todayAttendance->present ?? 0),
                'absent' => (int) ($todayAttendance->absent ?? 0),
                'late' => (int) ($todayAttendance->late ?? 0),
                'total' => $attendanceTotal,
                'percentage' => $attendancePercentage,
            ],
            'fee_collection' => [
                'collected' => 0,
                'pending' => 0,
                'total' => 0,
            ],
            'recent_notices' => [],
            'upcoming_events' => [],
        ];
    }

    /**
     * Get empty stats for new schools or users without tenant.
     */
    private function getEmptyStats(): array
    {
        return [
            'total_students' => 0,
            'total_teachers' => 0,
            'total_classes' => 0,
            'total_sections' => 0,
            'attendance_today' => [
                'present' => 0,
                'absent' => 0,
                'late' => 0,
                'total' => 0,
                'percentage' => 0,
            ],
            'fee_collection' => [
                'collected' => 0,
                'pending' => 0,
                'total' => 0,
            ],
            'recent_notices' => [],
            'upcoming_events' => [],
        ];
    }
}
