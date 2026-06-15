<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AdmissionController;
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

// Documentation
Route::get('docs/{slug?}', [\App\Http\Controllers\DocsController::class, 'index'])->name('docs');

// Admissions Public Form
Route::get('admissions/apply', [AdmissionController::class, 'create'])->name('admissions.apply');
Route::post('admissions/apply', [AdmissionController::class, 'store'])->name('admissions.store');

// Public Result Lookup (by roll number, per school)
Route::get('results/{tenant:slug}', [\App\Http\Controllers\PublicResultController::class, 'show'])->name('results.show');
Route::post('results/{tenant:slug}', [\App\Http\Controllers\PublicResultController::class, 'lookup'])
    ->middleware('throttle:30,1')->name('results.lookup');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // School Settings (school-level administrators only)
    Route::prefix('school-settings')->name('school-settings.')
        ->middleware('permission:manage-settings')
        ->group(function () {
            Route::get('/', [\App\Http\Controllers\SchoolSettingsController::class, 'index'])->name('index');
            Route::put('/general', [\App\Http\Controllers\SchoolSettingsController::class, 'updateGeneral'])->name('general');
            Route::put('/branding', [\App\Http\Controllers\SchoolSettingsController::class, 'updateBranding'])->name('branding');
            Route::put('/academic', [\App\Http\Controllers\SchoolSettingsController::class, 'updateAcademic'])->name('academic');
            Route::post('/logo', [\App\Http\Controllers\SchoolSettingsController::class, 'uploadLogo'])->name('logo');
            Route::post('/favicon', [\App\Http\Controllers\SchoolSettingsController::class, 'uploadFavicon'])->name('favicon');
        });

    // Roles & Permissions Management.
    // Roles are global (Spatie teams disabled), so only the platform super-admin
    // may manage them — otherwise a school admin could edit roles for every tenant.
    Route::resource('roles', \App\Http\Controllers\RoleController::class)
        ->middleware('role:super-admin');

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

    // Admissions Management
    Route::get('admissions', [AdmissionController::class, 'index'])->name('admissions.index');
    Route::get('admissions/{application}', [AdmissionController::class, 'show'])->name('admissions.show');
    Route::post('admissions/{application}/status', [AdmissionController::class, 'updateStatus'])->name('admissions.status.update');

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
        Route::post('structures/{structure}/allocate', [FeeStructureController::class, 'allocate'])
            ->name('structures.allocate');
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

    // Communication — SMS rail
    Route::prefix('communication')->name('communication.')->group(function () {
        Route::middleware('permission:send-notifications')->group(function () {
            Route::get('sms', [\App\Http\Controllers\Communication\SmsController::class, 'index'])->name('sms.index');
            Route::post('sms/send', [\App\Http\Controllers\Communication\SmsController::class, 'send'])->name('sms.send');
            Route::post('sms/test', [\App\Http\Controllers\Communication\SmsController::class, 'test'])->name('sms.test');

            Route::post('templates', [\App\Http\Controllers\Communication\NotificationTemplateController::class, 'store'])->name('templates.store');
            Route::put('templates/{template}', [\App\Http\Controllers\Communication\NotificationTemplateController::class, 'update'])->name('templates.update');
            Route::delete('templates/{template}', [\App\Http\Controllers\Communication\NotificationTemplateController::class, 'destroy'])->name('templates.destroy');
        });

        // Provider configuration is an administrative action.
        Route::middleware('permission:manage-settings')->put('sms/settings', [\App\Http\Controllers\Communication\SmsController::class, 'updateSettings'])->name('sms.settings');
    });

    // Examination — result publishing
    Route::middleware('permission:publish-results')->group(function () {
        Route::get('exams/results', [\App\Http\Controllers\Exam\ResultController::class, 'index'])->name('exams.results.index');
        Route::post('exams/{exam}/publish', [\App\Http\Controllers\Exam\ResultController::class, 'publish'])->name('exams.publish');
        Route::post('exams/{exam}/unpublish', [\App\Http\Controllers\Exam\ResultController::class, 'unpublish'])->name('exams.unpublish');
    });

    // Examination — management, scheduling & marks entry
    Route::get('exams', [\App\Http\Controllers\Exam\ExamController::class, 'index'])
        ->middleware('permission:view-exams')->name('exams.index');

    Route::middleware('permission:create-exams,edit-exams,manage-exams')->group(function () {
        Route::get('exams/create', [\App\Http\Controllers\Exam\ExamController::class, 'create'])->name('exams.create');
        Route::post('exams', [\App\Http\Controllers\Exam\ExamController::class, 'store'])->name('exams.store');
        Route::get('exams/{exam}/edit', [\App\Http\Controllers\Exam\ExamController::class, 'edit'])->whereNumber('exam')->name('exams.edit');
        Route::put('exams/{exam}', [\App\Http\Controllers\Exam\ExamController::class, 'update'])->whereNumber('exam')->name('exams.update');
        Route::delete('exams/{exam}', [\App\Http\Controllers\Exam\ExamController::class, 'destroy'])->whereNumber('exam')->name('exams.destroy');
        Route::post('exams/{exam}/schedules', [\App\Http\Controllers\Exam\ExamScheduleController::class, 'store'])->whereNumber('exam')->name('exams.schedules.store');
        Route::delete('exam-schedules/{schedule}', [\App\Http\Controllers\Exam\ExamScheduleController::class, 'destroy'])->name('exam-schedules.destroy');
    });

    Route::get('exams/{exam}', [\App\Http\Controllers\Exam\ExamController::class, 'show'])
        ->whereNumber('exam')->middleware('permission:view-exams')->name('exams.show');

    Route::middleware('permission:enter-results,manage-results')->group(function () {
        Route::get('exam-schedules/{schedule}/marks', [\App\Http\Controllers\Exam\MarksController::class, 'edit'])->name('exam-schedules.marks.edit');
        Route::put('exam-schedules/{schedule}/marks', [\App\Http\Controllers\Exam\MarksController::class, 'update'])->name('exam-schedules.marks.update');
        Route::post('exams/{exam}/report-cards', [\App\Http\Controllers\Exam\ExamController::class, 'generateReportCards'])->whereNumber('exam')->name('exams.report-cards.generate');
    });

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
