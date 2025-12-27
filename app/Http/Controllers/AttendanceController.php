<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display attendance dashboard with overview.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;
        $date = $request->input('date', now()->format('Y-m-d'));

        // Build queries
        $classQuery = SchoolClass::query();
        $sectionQuery = Section::query();
        
        if ($tenantId) {
            $classQuery->forTenant($tenantId);
            $sectionQuery->forTenant($tenantId);
        }

        $classes = $classQuery->active()->ordered()->withCount(['sections'])->get();

        // Get today's attendance summary per class
        $attendanceSummary = [];
        foreach ($classes as $class) {
            $query = Attendance::query()->forDate($date)->where('class_id', $class->id);
            if ($tenantId) {
                $query->forTenant($tenantId);
            }
            
            $attendanceSummary[$class->id] = [
                'total' => $query->count(),
                'present' => (clone $query)->withStatus('present')->count(),
                'absent' => (clone $query)->withStatus('absent')->count(),
                'late' => (clone $query)->withStatus('late')->count(),
            ];
        }

        return Inertia::render('attendance/index', [
            'classes' => $classes,
            'attendanceSummary' => $attendanceSummary,
            'selectedDate' => $date,
        ]);
    }

    /**
     * Show the attendance marking form for a section.
     */
    public function mark(Request $request): Response
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'date' => 'nullable|date',
        ]);

        $user = $request->user();
        $tenantId = $user->tenant_id;
        $sectionId = $request->input('section_id');
        $date = $request->input('date', now()->format('Y-m-d'));

        $section = Section::with(['schoolClass', 'academicYear'])->findOrFail($sectionId);
        
        // Authorize tenant access
        if ($tenantId && $section->tenant_id !== $tenantId) {
            abort(403, 'Unauthorized access to this section.');
        }

        // Get students in this section
        $studentQuery = Student::query()
            ->where('section_id', $sectionId)
            ->with('user')
            ->active();
        
        if ($tenantId) {
            $studentQuery->forTenant($tenantId);
        }
        
        $students = $studentQuery->orderBy('roll_number')->get();

        // Get existing attendance for this date
        $existingAttendance = Attendance::where('section_id', $sectionId)
            ->forDate($date)
            ->get()
            ->keyBy('student_id');

        // Merge attendance data with students
        $studentsWithAttendance = $students->map(function ($student) use ($existingAttendance) {
            $attendance = $existingAttendance->get($student->id);
            return [
                'id' => $student->id,
                'name' => $student->user?->name ?? 'Unknown',
                'roll_number' => $student->roll_number,
                'admission_no' => $student->admission_no,
                'status' => $attendance?->status ?? null,
                'remarks' => $attendance?->remarks ?? '',
                'attendance_id' => $attendance?->id ?? null,
            ];
        });

        return Inertia::render('attendance/mark', [
            'section' => $section,
            'students' => $studentsWithAttendance,
            'date' => $date,
            'isMarked' => $existingAttendance->isNotEmpty(),
        ]);
    }

    /**
     * Store attendance records.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'date' => 'required|date',
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status' => 'required|in:present,absent,late,excused',
            'attendance.*.remarks' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $tenantId = $user->tenant_id;
        $section = Section::with(['schoolClass'])->findOrFail($validated['section_id']);

        // Authorize tenant access
        if ($tenantId && $section->tenant_id !== $tenantId) {
            abort(403, 'Unauthorized access to this section.');
        }

        // Get current academic year
        $academicYearQuery = AcademicYear::query()->current();
        if ($tenantId) {
            $academicYearQuery->forTenant($tenantId);
        }
        $academicYear = $academicYearQuery->first();

        foreach ($validated['attendance'] as $record) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $record['student_id'],
                    'date' => $validated['date'],
                ],
                [
                    'tenant_id' => $section->tenant_id,
                    'class_id' => $section->class_id,
                    'section_id' => $validated['section_id'],
                    'academic_year_id' => $academicYear?->id,
                    'status' => $record['status'],
                    'remarks' => $record['remarks'] ?? null,
                    'marked_by_user_id' => $user->id,
                ]
            );
        }

        return redirect()->route('attendance.index')
            ->with('success', 'Attendance marked successfully for ' . $section->schoolClass->name . ' - ' . $section->name);
    }

    /**
     * Show attendance report.
     */
    public function report(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $classQuery = SchoolClass::query();
        $sectionQuery = Section::query();

        if ($tenantId) {
            $classQuery->forTenant($tenantId);
            $sectionQuery->forTenant($tenantId);
        }

        $classes = $classQuery->active()->ordered()->get();
        $sections = $sectionQuery->where('is_active', true)->get();

        // Get filter values
        $filters = [
            'class_id' => $request->input('class_id'),
            'section_id' => $request->input('section_id'),
            'start_date' => $request->input('start_date', now()->startOfMonth()->format('Y-m-d')),
            'end_date' => $request->input('end_date', now()->format('Y-m-d')),
        ];

        $attendanceData = [];
        
        if ($filters['section_id']) {
            $query = Attendance::query()
                ->where('section_id', $filters['section_id'])
                ->betweenDates($filters['start_date'], $filters['end_date'])
                ->with(['student.user']);
            
            if ($tenantId) {
                $query->forTenant($tenantId);
            }

            $attendanceData = $query->get()
                ->groupBy('student_id')
                ->map(function ($records, $studentId) {
                    $first = $records->first();
                    return [
                        'student_id' => $studentId,
                        'student_name' => $first->student?->user?->name ?? 'Unknown',
                        'total_days' => $records->count(),
                        'present' => $records->where('status', 'present')->count(),
                        'absent' => $records->where('status', 'absent')->count(),
                        'late' => $records->where('status', 'late')->count(),
                        'percentage' => $records->count() > 0 
                            ? round(($records->whereIn('status', ['present', 'late'])->count() / $records->count()) * 100, 1)
                            : 0,
                    ];
                })
                ->values();
        }

        return Inertia::render('attendance/report', [
            'classes' => $classes,
            'sections' => $sections,
            'filters' => $filters,
            'attendanceData' => $attendanceData,
        ]);
    }

    /**
     * Select section for marking attendance.
     */
    public function selectSection(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $classQuery = SchoolClass::query();
        
        if ($tenantId) {
            $classQuery->forTenant($tenantId);
        }

        $classes = $classQuery
            ->active()
            ->ordered()
            ->with(['sections' => fn($q) => $q->where('is_active', true)])
            ->get();

        return Inertia::render('attendance/select-section', [
            'classes' => $classes,
            'selectedDate' => $request->input('date', now()->format('Y-m-d')),
        ]);
    }
}
