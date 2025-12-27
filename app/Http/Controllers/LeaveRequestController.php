<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $query = LeaveRequest::query()
            ->with(['requestable', 'reviewer', 'academicYear']);

        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        // Filter by status
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Filter by type
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('leave_type', $request->input('type'));
        }

        // Filter by requester type
        if ($request->filled('requester') && $request->input('requester') !== 'all') {
            if ($request->input('requester') === 'student') {
                $query->where('requestable_type', Student::class);
            } else {
                $query->where('requestable_type', User::class);
            }
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereHasMorph('requestable', [Student::class], function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                })->orWhereHasMorph('requestable', [User::class], function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            });
        }

        $leaveRequests = $query->orderBy('created_at', 'desc')->paginate(20);

        // Stats
        $stats = [
            'pending' => LeaveRequest::query()
                ->when($tenantId, fn($q) => $q->forTenant($tenantId))
                ->pending()
                ->count(),
            'approved' => LeaveRequest::query()
                ->when($tenantId, fn($q) => $q->forTenant($tenantId))
                ->approved()
                ->whereMonth('created_at', now()->month)
                ->count(),
            'rejected' => LeaveRequest::query()
                ->when($tenantId, fn($q) => $q->forTenant($tenantId))
                ->rejected()
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        return Inertia::render('leave-requests/index', [
            'leaveRequests' => $leaveRequests,
            'stats' => $stats,
            'leaveTypes' => LeaveRequest::leaveTypes(),
            'filters' => $request->only(['status', 'type', 'requester', 'search']),
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Get students for dropdown
        $students = Student::query()
            ->when($tenantId, fn($q) => $q->forTenant($tenantId))
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'admission_number']);

        // Get staff/users for dropdown
        $staff = User::query()
            ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('leave-requests/create', [
            'students' => $students,
            'staff' => $staff,
            'leaveTypes' => LeaveRequest::leaveTypes(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'requester_type' => 'required|in:student,staff',
            'requester_id' => 'required|integer',
            'leave_type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        
        // Calculate total days
        $startDate = \Carbon\Carbon::parse($validated['start_date']);
        $endDate = \Carbon\Carbon::parse($validated['end_date']);
        $totalDays = $startDate->diffInDays($endDate) + 1;

        LeaveRequest::create([
            'tenant_id' => $user->tenant_id,
            'requestable_type' => $validated['requester_type'] === 'student' ? Student::class : User::class,
            'requestable_id' => $validated['requester_id'],
            'leave_type' => $validated['leave_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_days' => $totalDays,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return redirect()->route('leave-requests.index')
            ->with('success', 'Leave request submitted successfully.');
    }

    public function show(LeaveRequest $leaveRequest): Response
    {
        $leaveRequest->load(['requestable', 'reviewer', 'academicYear']);

        return Inertia::render('leave-requests/show', [
            'leaveRequest' => $leaveRequest,
            'leaveTypes' => LeaveRequest::leaveTypes(),
        ]);
    }

    public function approve(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        $leaveRequest->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_remarks' => $validated['remarks'] ?? null,
        ]);

        return back()->with('success', 'Leave request approved.');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'required|string|max:500',
        ]);

        $leaveRequest->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_remarks' => $validated['remarks'],
        ]);

        return back()->with('success', 'Leave request rejected.');
    }

    public function destroy(LeaveRequest $leaveRequest): RedirectResponse
    {
        $leaveRequest->delete();

        return redirect()->route('leave-requests.index')
            ->with('success', 'Leave request deleted.');
    }
}
