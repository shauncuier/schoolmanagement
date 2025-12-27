<?php

namespace App\Http\Controllers;

use App\Models\FeePayment;
use App\Models\SchoolClass;
use App\Models\StudentFeeAllocation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Date range (default to current month)
        $fromDate = $request->input('from_date', now()->startOfMonth()->toDateString());
        $toDate = $request->input('to_date', now()->endOfMonth()->toDateString());

        // Build payments query
        $paymentsQuery = FeePayment::query()
            ->with(['student.section.schoolClass']);

        if ($tenantId) {
            $paymentsQuery->forTenant($tenantId);
        }

        $paymentsQuery->completed()
            ->whereBetween('paid_at', [$fromDate, $toDate . ' 23:59:59']);

        // Get summary stats
        $totalCollected = (clone $paymentsQuery)->sum('total_amount');
        $totalTransactions = (clone $paymentsQuery)->count();
        $avgTransaction = $totalTransactions > 0 ? $totalCollected / $totalTransactions : 0;

        // Collection by payment method
        $byMethod = (clone $paymentsQuery)
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as total')
            ->groupBy('payment_method')
            ->get();

        // Daily collection for chart
        $dailyCollection = (clone $paymentsQuery)
            ->selectRaw('DATE(paid_at) as date, SUM(total_amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Outstanding fees
        $outstandingQuery = StudentFeeAllocation::query()
            ->with(['student.section.schoolClass', 'feeStructure.feeCategory'])
            ->pending();
        
        if ($tenantId) {
            $outstandingQuery->forTenant($tenantId);
        }

        $totalOutstanding = (clone $outstandingQuery)->sum('due_amount');
        $overdueCount = (clone $outstandingQuery)
            ->where('due_date', '<', now())
            ->count();

        // Collection by class
        $byClass = FeePayment::query()
            ->join('students', 'fee_payments.student_id', '=', 'students.id')
            ->join('sections', 'students.section_id', '=', 'sections.id')
            ->join('classes', 'sections.class_id', '=', 'classes.id')
            ->when($tenantId, fn($q) => $q->where('fee_payments.tenant_id', $tenantId))
            ->where('fee_payments.status', 'completed')
            ->whereBetween('fee_payments.paid_at', [$fromDate, $toDate . ' 23:59:59'])
            ->selectRaw('classes.name as class_name, COUNT(*) as count, SUM(fee_payments.total_amount) as total')
            ->groupBy('classes.id', 'classes.name')
            ->orderBy('total', 'desc')
            ->get();

        // Top defaulters (students with highest outstanding)
        $defaulters = StudentFeeAllocation::query()
            ->with(['student.section.schoolClass'])
            ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->pending()
            ->where('due_date', '<', now())
            ->selectRaw('student_id, SUM(due_amount) as total_due')
            ->groupBy('student_id')
            ->orderBy('total_due', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $item->load('student.section.schoolClass');
                return $item;
            });

        return Inertia::render('fees/reports/index', [
            'stats' => [
                'totalCollected' => $totalCollected,
                'totalTransactions' => $totalTransactions,
                'avgTransaction' => $avgTransaction,
                'totalOutstanding' => $totalOutstanding,
                'overdueCount' => $overdueCount,
            ],
            'byMethod' => $byMethod,
            'dailyCollection' => $dailyCollection,
            'byClass' => $byClass,
            'defaulters' => $defaulters,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
        ]);
    }
}
