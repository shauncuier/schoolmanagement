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
        $totalSchools = \App\Models\Tenant::count();
        $totalUsers = \App\Models\User::count();
        $activeSubscriptions = \App\Models\Tenant::whereNotNull('subscription_plan')
            ->where('subscription_plan', '!=', 'free')
            ->count();
            
        // Mock revenue calculation for demo based on plan prices
        $revenue = \App\Models\Tenant::all()->sum(function($tenant) {
            $prices = ['free' => 0, 'basic' => 999, 'standard' => 2499, 'premium' => 4999];
            return $prices[$tenant->subscription_plan] ?? 0;
        });

        return Inertia::render('dashboard', [
            'stats' => [
                'is_super_admin' => true,
                'total_schools' => $totalSchools,
                'total_users' => $totalUsers,
                'active_subscriptions' => $activeSubscriptions,
                'monthly_revenue' => $revenue,
                'recent_schools' => \App\Models\Tenant::latest()->take(5)->get()->map(function($tenant) {
                    return [
                        'id' => $tenant->id,
                        'name' => $tenant->name,
                        'subscription_plan' => $tenant->subscription_plan,
                        'created_at' => $tenant->created_at->diffForHumans(),
                    ];
                }),
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
