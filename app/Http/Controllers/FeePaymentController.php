<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\FeePayment;
use App\Models\Student;
use App\Models\StudentFeeAllocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeePaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        $query = FeePayment::query()
            ->with(['student', 'allocation.feeStructure.feeCategory', 'collector']);
        
        if ($tenantId) {
            $query->forTenant($tenantId);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                    ->orWhereHas('student', function ($sq) use ($search) {
                        $sq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('admission_number', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('from_date')) {
            $query->where('paid_at', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->where('paid_at', '<=', $request->input('to_date') . ' 23:59:59');
        }

        $payments = $query->orderBy('paid_at', 'desc')->paginate(20);

        // Summary stats
        $statsQuery = FeePayment::query()->completed();
        if ($tenantId) {
            $statsQuery->forTenant($tenantId);
        }
        $todayCollection = $statsQuery->clone()->whereDate('paid_at', today())->sum('total_amount');
        $monthCollection = $statsQuery->clone()->whereMonth('paid_at', now()->month)->whereYear('paid_at', now()->year)->sum('total_amount');

        return Inertia::render('fees/payments/index', [
            'payments' => $payments,
            'stats' => [
                'today' => $todayCollection,
                'month' => $monthCollection,
            ],
            'filters' => [
                'status' => $request->input('status'),
                'payment_method' => $request->input('payment_method'),
                'search' => $request->input('search'),
                'from_date' => $request->input('from_date'),
                'to_date' => $request->input('to_date'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Get students with pending fees
        $studentsQuery = Student::query()
            ->with(['section.schoolClass'])
            ->whereHas('feeAllocations', fn($q) => $q->pending());
        
        if ($tenantId) {
            $studentsQuery->where('tenant_id', $tenantId);
        }

        $students = $studentsQuery->active()->get();

        return Inertia::render('fees/payments/create', [
            'students' => $students,
        ]);
    }

    public function getStudentFees(Request $request, Student $student): \Illuminate\Http\JsonResponse
    {
        $allocations = StudentFeeAllocation::where('student_id', $student->id)
            ->with(['feeStructure.feeCategory'])
            ->pending()
            ->get();

        return response()->json([
            'allocations' => $allocations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'allocation_id' => 'required|exists:student_fee_allocations,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,bank_transfer,online,cheque,mobile_banking',
            'transaction_id' => 'nullable|string|max:100',
            'bank_name' => 'nullable|string|max:100',
            'cheque_number' => 'nullable|string|max:50',
            'cheque_date' => 'nullable|date',
            'remarks' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $allocation = StudentFeeAllocation::findOrFail($validated['allocation_id']);
        
        // Calculate late fee if overdue
        $lateFee = 0;
        if ($allocation->due_date && $allocation->due_date < now()) {
            $structure = $allocation->feeStructure;
            if ($structure && $structure->late_fee > 0) {
                $daysLate = now()->diffInDays($allocation->due_date);
                $graceDays = $structure->late_fee_grace_days ?? 0;
                if ($daysLate > $graceDays) {
                    $lateFee = $structure->late_fee;
                }
            }
        }

        $totalAmount = $validated['amount'] + $lateFee;

        $payment = FeePayment::create([
            'tenant_id' => $user->tenant_id,
            'student_id' => $validated['student_id'],
            'student_fee_allocation_id' => $validated['allocation_id'],
            'academic_year_id' => $allocation->academic_year_id,
            'receipt_number' => FeePayment::generateReceiptNumber($user->tenant_id),
            'amount' => $validated['amount'],
            'late_fee' => $lateFee,
            'total_amount' => $totalAmount,
            'payment_method' => $validated['payment_method'],
            'transaction_id' => $validated['transaction_id'] ?? null,
            'bank_name' => $validated['bank_name'] ?? null,
            'cheque_number' => $validated['cheque_number'] ?? null,
            'cheque_date' => $validated['cheque_date'] ?? null,
            'status' => 'completed',
            'remarks' => $validated['remarks'] ?? null,
            'collected_by' => $user->id,
            'paid_at' => now(),
        ]);

        // Update allocation
        $allocation->updateAfterPayment($validated['amount']);

        return redirect()->route('fees.payments.receipt', $payment)
            ->with('success', 'Payment recorded successfully.');
    }

    public function receipt(FeePayment $payment): Response
    {
        $this->authorizeForTenant($payment);

        $payment->load([
            'student.section.schoolClass',
            'allocation.feeStructure.feeCategory',
            'collector',
        ]);

        return Inertia::render('fees/payments/receipt', [
            'payment' => $payment,
        ]);
    }

    private function authorizeForTenant(FeePayment $payment): void
    {
        $user = request()->user();
        if ($user->tenant_id === null) return;
        if ($payment->tenant_id !== $user->tenant_id) {
            abort(403, 'Unauthorized access.');
        }
    }
}
