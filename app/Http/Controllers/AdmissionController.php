<?php

namespace App\Http\Controllers;

use App\Models\AdmissionApplication;
use App\Models\SchoolClass;
use App\Models\AcademicYear;
use App\Domains\Students\Services\AdmissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;

class AdmissionController extends Controller
{
    protected $admissionService;

    public function __construct(AdmissionService $admissionService)
    {
        $this->admissionService = $admissionService;
    }

    /**
     * Display a listing of admission applications.
     */
    public function index(Request $request)
    {
        $applications = AdmissionApplication::with(['schoolClass', 'academicYear'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('application_no', 'like', "%{$search}%")
                        ->orWhere('guardian_phone', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                if ($status !== 'all') {
                    $query->where('status', $status);
                }
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admissions/index', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new admission application (Public or Admin).
     */
    public function create()
    {
        return Inertia::render('admissions/create', [
            'classes' => SchoolClass::all(),
            'academicYears' => AcademicYear::where('is_active', true)->get(),
        ]);
    }

    /**
     * Store a newly created admission application.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'class_id' => 'required|exists:classes,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'guardian_name' => 'required|string|max:255',
            'guardian_relation' => 'required|string',
            'guardian_phone' => 'required|string',
            'guardian_email' => 'nullable|email',
            'address' => 'nullable|string',
        ]);

        $validated['application_no'] = 'ADM-' . date('Y') . '-' . strtoupper(Str::random(6));
        $validated['status'] = 'pending';

        AdmissionApplication::create($validated);

        return Redirect::back()->with('success', 'Application submitted successfully.');
    }

    /**
     * Display the specified admission application.
     */
    public function show(AdmissionApplication $application)
    {
        return Inertia::render('admissions/show', [
            'application' => $application->load(['schoolClass', 'academicYear', 'processor']),
        ]);
    }

    /**
     * Update the status of the application.
     */
    public function updateStatus(Request $request, AdmissionApplication $application)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,under_review,interview_scheduled,approved,rejected',
            'admin_remarks' => 'nullable|string',
            'interview_date' => 'nullable|date',
        ]);

        $application->update($validated + ['processed_by' => auth()->id()]);

        if ($validated['status'] === 'approved') {
            $this->admissionService->convertToStudent($application);
            return Redirect::route('students.index')->with('success', 'Application approved and student created.');
        }

        return Redirect::back()->with('success', 'Application status updated.');
    }
}
