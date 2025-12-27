<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeeCategoryController;
use App\Http\Controllers\FeePaymentController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\GuardianController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TimetableController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Academic Year Management
    Route::resource('academic-years', AcademicYearController::class);
    Route::post('academic-years/{academic_year}/set-current', [AcademicYearController::class, 'setCurrent'])
        ->name('academic-years.set-current');

    // Class Management
    Route::resource('classes', ClassController::class)->except(['show']);

    // Section Management
    Route::resource('sections', SectionController::class)->except(['show']);

    // Subject Management
    Route::resource('subjects', SubjectController::class)->except(['show']);

    // Student Management
    Route::resource('students', StudentController::class);

    // Teacher Management
    Route::resource('teachers', TeacherController::class);

    // Guardian (Parents) Management
    Route::resource('guardians', GuardianController::class);

    // Staff Management
    Route::resource('staff', StaffController::class)->except(['show']);

    // Attendance Management
    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('attendance/select-section', [AttendanceController::class, 'selectSection'])->name('attendance.select-section');
    Route::get('attendance/mark', [AttendanceController::class, 'mark'])->name('attendance.mark');
    Route::post('attendance', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::get('attendance/report', [AttendanceController::class, 'report'])->name('attendance.report');

    // Timetable Management
    Route::get('timetable', [TimetableController::class, 'index'])->name('timetable.index');
    Route::get('timetable/edit', [TimetableController::class, 'edit'])->name('timetable.edit');
    Route::post('timetable', [TimetableController::class, 'store'])->name('timetable.store');
    Route::get('timetable/slots', [TimetableController::class, 'slots'])->name('timetable.slots');
    Route::post('timetable/slots', [TimetableController::class, 'storeSlot'])->name('timetable.slots.store');
    Route::delete('timetable/slots/{slot}', [TimetableController::class, 'destroySlot'])->name('timetable.slots.destroy');

    // Fee Management
    Route::prefix('fees')->name('fees.')->group(function () {
        Route::resource('categories', FeeCategoryController::class)->except(['show']);
        Route::resource('structures', FeeStructureController::class)->except(['show']);
        Route::get('payments', [FeePaymentController::class, 'index'])->name('payments.index');
        Route::get('payments/create', [FeePaymentController::class, 'create'])->name('payments.create');
        Route::post('payments', [FeePaymentController::class, 'store'])->name('payments.store');
        Route::get('payments/{payment}/receipt', [FeePaymentController::class, 'receipt'])->name('payments.receipt');
        Route::get('students/{student}/fees', [FeePaymentController::class, 'getStudentFees'])->name('students.fees');
        Route::get('reports', [\App\Http\Controllers\FeeReportController::class, 'index'])->name('reports.index');
    });

    // Leave Requests
    Route::resource('leave-requests', \App\Http\Controllers\LeaveRequestController::class)->except(['edit', 'update']);
    Route::post('leave-requests/{leave_request}/approve', [\App\Http\Controllers\LeaveRequestController::class, 'approve'])->name('leave-requests.approve');
    Route::post('leave-requests/{leave_request}/reject', [\App\Http\Controllers\LeaveRequestController::class, 'reject'])->name('leave-requests.reject');

    // Admin Routes (Super Admin Only)
    Route::prefix('admin')->name('admin.')->group(function () {
        // Schools (Tenants) Management
        Route::resource('schools', \App\Http\Controllers\Admin\SchoolController::class);
        Route::post('schools/{school}/toggle-status', [\App\Http\Controllers\Admin\SchoolController::class, 'toggleStatus'])
            ->name('schools.toggle-status');

        // Users Management
        Route::get('users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
        Route::get('users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'show'])->name('users.show');
        Route::get('users/{user}/edit', [\App\Http\Controllers\Admin\UserController::class, 'edit'])->name('users.edit');
        Route::put('users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
        Route::post('users/{user}/toggle-status', [\App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])
            ->name('users.toggle-status');
        Route::post('users/{user}/restore', [\App\Http\Controllers\Admin\UserController::class, 'restore'])->name('users.restore');
        Route::delete('users/{user}/force-delete', [\App\Http\Controllers\Admin\UserController::class, 'forceDelete'])
            ->name('users.force-delete');

        // Subscriptions Management
        Route::get('subscriptions', [\App\Http\Controllers\Admin\SubscriptionController::class, 'index'])
            ->name('subscriptions.index');
        Route::put('subscriptions/{tenant}', [\App\Http\Controllers\Admin\SubscriptionController::class, 'update'])
            ->name('subscriptions.update');
        Route::post('subscriptions/{tenant}/extend', [\App\Http\Controllers\Admin\SubscriptionController::class, 'extend'])
            ->name('subscriptions.extend');
        Route::post('subscriptions/{tenant}/cancel', [\App\Http\Controllers\Admin\SubscriptionController::class, 'cancel'])
            ->name('subscriptions.cancel');

        // System Settings
        Route::get('settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('settings.index');
        Route::put('settings/general', [\App\Http\Controllers\Admin\SettingsController::class, 'updateGeneral'])
            ->name('settings.general');
        Route::put('settings/email', [\App\Http\Controllers\Admin\SettingsController::class, 'updateEmail'])
            ->name('settings.email');
        Route::put('settings/features', [\App\Http\Controllers\Admin\SettingsController::class, 'updateFeatures'])
            ->name('settings.features');
        Route::put('settings/security', [\App\Http\Controllers\Admin\SettingsController::class, 'updateSecurity'])
            ->name('settings.security');
        Route::post('settings/clear-cache', [\App\Http\Controllers\Admin\SettingsController::class, 'clearCache'])
            ->name('settings.clear-cache');
    });
});

require __DIR__.'/settings.php';

