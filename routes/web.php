<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Admin\SchoolController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\Communication\NotificationTemplateController;
use App\Http\Controllers\Communication\SmsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocsController;
use App\Http\Controllers\Exam\ExamController;
use App\Http\Controllers\Exam\ExamScheduleController;
use App\Http\Controllers\Exam\MarksController;
use App\Http\Controllers\Exam\ReportCardController;
use App\Http\Controllers\Exam\ResultController;
use App\Http\Controllers\Fee\PaymentController;
use App\Http\Controllers\FeeCategoryController;
use App\Http\Controllers\FeePaymentController;
use App\Http\Controllers\FeeReportController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\GuardianController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\PublicResultController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SchoolSettingsController;
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
Route::get('docs/{slug?}', [DocsController::class, 'index'])->name('docs');

// Admissions Public Form
Route::get('admissions/apply', [AdmissionController::class, 'create'])->name('admissions.apply');
Route::post('admissions/apply', [AdmissionController::class, 'store'])->name('admissions.store');

// Public Result Lookup (by roll number, per school)
Route::get('results/{tenant:slug}', [PublicResultController::class, 'show'])->name('results.show');
Route::post('results/{tenant:slug}', [PublicResultController::class, 'lookup'])
    ->middleware('throttle:30,1')->name('results.lookup');

// Public payment gateway callback / IPN (idempotent, no auth).
Route::match(['get', 'post'], 'fees/pay/callback/{gateway}', [PaymentController::class, 'callback'])
    ->middleware('throttle:60,1')->name('fees.pay.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // School Settings (school-level administrators only)
    Route::prefix('school-settings')->name('school-settings.')
        ->middleware('permission:manage-settings')
        ->group(function () {
            Route::get('/', [SchoolSettingsController::class, 'index'])->name('index');
            Route::put('/general', [SchoolSettingsController::class, 'updateGeneral'])->name('general');
            Route::put('/branding', [SchoolSettingsController::class, 'updateBranding'])->name('branding');
            Route::put('/academic', [SchoolSettingsController::class, 'updateAcademic'])->name('academic');
            Route::post('/logo', [SchoolSettingsController::class, 'uploadLogo'])->name('logo');
            Route::post('/favicon', [SchoolSettingsController::class, 'uploadFavicon'])->name('favicon');
        });

    // Roles & Permissions Management.
    // Roles are global (Spatie teams disabled), so only the platform super-admin
    // may manage them — otherwise a school admin could edit roles for every tenant.
    Route::resource('roles', RoleController::class)
        ->middleware('role:super-admin');

    // Academic Year Management
    Route::middleware('permission:view-academic-years')->group(function () {
        Route::resource('academic-years', AcademicYearController::class);
        Route::post('academic-years/{academic_year}/set-current', [AcademicYearController::class, 'setCurrent'])
            ->name('academic-years.set-current');
    });

    // Class Management
    Route::resource('classes', ClassController::class)->except(['show'])->middleware('permission:view-classes');

    // Section Management
    Route::resource('sections', SectionController::class)->except(['show'])->middleware('permission:view-sections');

    // Subject Management
    Route::resource('subjects', SubjectController::class)->except(['show'])->middleware('permission:view-subjects');

    // Student Management
    Route::resource('students', StudentController::class)->middleware('permission:view-students');

    // Teacher Management
    Route::resource('teachers', TeacherController::class)->middleware('permission:view-teachers');

    // Guardian (Parents) Management
    Route::resource('guardians', GuardianController::class)->middleware('permission:view-guardians');

    // Staff Management
    Route::resource('staff', StaffController::class)->except(['show'])->middleware('permission:view-teachers');

    // Admissions Management
    Route::middleware('permission:view-students')->group(function () {
        Route::get('admissions', [AdmissionController::class, 'index'])->name('admissions.index');
        Route::get('admissions/{application}', [AdmissionController::class, 'show'])->name('admissions.show');
        Route::post('admissions/{application}/status', [AdmissionController::class, 'updateStatus'])->name('admissions.status.update');
    });

    // Attendance Management
    Route::middleware('permission:view-attendance')->group(function () {
        Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
        Route::get('attendance/select-section', [AttendanceController::class, 'selectSection'])->name('attendance.select-section');
        Route::get('attendance/mark', [AttendanceController::class, 'mark'])->name('attendance.mark');
        Route::post('attendance', [AttendanceController::class, 'store'])->name('attendance.store');
        Route::get('attendance/report', [AttendanceController::class, 'report'])->name('attendance.report');
    });

    // Timetable Management
    Route::middleware('permission:view-timetable')->group(function () {
        Route::get('timetable', [TimetableController::class, 'index'])->name('timetable.index');
        Route::get('timetable/edit', [TimetableController::class, 'edit'])->name('timetable.edit');
        Route::post('timetable', [TimetableController::class, 'store'])->name('timetable.store');
        Route::get('timetable/slots', [TimetableController::class, 'slots'])->name('timetable.slots');
        Route::post('timetable/slots', [TimetableController::class, 'storeSlot'])->name('timetable.slots.store');
        Route::delete('timetable/slots/{slot}', [TimetableController::class, 'destroySlot'])->name('timetable.slots.destroy');
    });

    // Audit trail
    Route::get('activity-logs', [ActivityLogController::class, 'index'])
        ->middleware('permission:manage-settings')->name('activity-logs.index');

    // Report card PDF (staff preview any; student/parent own published card)
    Route::get('report-cards/{reportCard}/pdf', [ReportCardController::class, 'download'])
        ->whereNumber('reportCard')->middleware('permission:view-report-cards')->name('report-cards.pdf');

    // Fee Management
    Route::prefix('fees')->name('fees.')->middleware('permission:view-fees')->group(function () {
        Route::resource('categories', FeeCategoryController::class)->except(['show']);
        Route::post('structures/{structure}/allocate', [FeeStructureController::class, 'allocate'])
            ->name('structures.allocate');
        Route::resource('structures', FeeStructureController::class)->except(['show']);
        // Online (MFS) payment — payer-facing
        Route::get('pay/{allocation}', [PaymentController::class, 'show'])->whereNumber('allocation')->name('pay.show');
        Route::post('pay/{allocation}', [PaymentController::class, 'initiate'])->whereNumber('allocation')->name('pay.initiate');
        Route::get('payment-status', [PaymentController::class, 'status'])->name('pay.status');

        Route::get('payments', [FeePaymentController::class, 'index'])->name('payments.index');
        Route::get('payments/create', [FeePaymentController::class, 'create'])->name('payments.create');
        Route::post('payments', [FeePaymentController::class, 'store'])->name('payments.store');
        Route::get('payments/{payment}/receipt', [FeePaymentController::class, 'receipt'])->name('payments.receipt');
        Route::get('students/{student}/fees', [FeePaymentController::class, 'getStudentFees'])->name('students.fees');
        Route::get('reports', [FeeReportController::class, 'index'])->name('reports.index');
    });

    // Leave Requests
    Route::resource('leave-requests', LeaveRequestController::class)->except(['edit', 'update']);
    Route::post('leave-requests/{leave_request}/approve', [LeaveRequestController::class, 'approve'])->name('leave-requests.approve');
    Route::post('leave-requests/{leave_request}/reject', [LeaveRequestController::class, 'reject'])->name('leave-requests.reject');

    // Communication — SMS rail
    Route::prefix('communication')->name('communication.')->group(function () {
        Route::middleware('permission:send-notifications')->group(function () {
            Route::get('sms', [SmsController::class, 'index'])->name('sms.index');
            Route::post('sms/send', [SmsController::class, 'send'])->name('sms.send');
            Route::post('sms/test', [SmsController::class, 'test'])->name('sms.test');

            Route::post('templates', [NotificationTemplateController::class, 'store'])->name('templates.store');
            Route::put('templates/{template}', [NotificationTemplateController::class, 'update'])->name('templates.update');
            Route::delete('templates/{template}', [NotificationTemplateController::class, 'destroy'])->name('templates.destroy');
        });

        // Provider configuration is an administrative action.
        Route::middleware('permission:manage-settings')->put('sms/settings', [SmsController::class, 'updateSettings'])->name('sms.settings');
    });

    // Examination — result publishing
    Route::middleware('permission:publish-results')->group(function () {
        Route::get('exams/results', [ResultController::class, 'index'])->name('exams.results.index');
        Route::post('exams/{exam}/publish', [ResultController::class, 'publish'])->name('exams.publish');
        Route::post('exams/{exam}/unpublish', [ResultController::class, 'unpublish'])->name('exams.unpublish');
    });

    // Examination — management, scheduling & marks entry
    Route::get('exams', [ExamController::class, 'index'])
        ->middleware('permission:view-exams')->name('exams.index');

    Route::middleware('permission:create-exams,edit-exams,manage-exams')->group(function () {
        Route::get('exams/create', [ExamController::class, 'create'])->name('exams.create');
        Route::post('exams', [ExamController::class, 'store'])->name('exams.store');
        Route::get('exams/{exam}/edit', [ExamController::class, 'edit'])->whereNumber('exam')->name('exams.edit');
        Route::put('exams/{exam}', [ExamController::class, 'update'])->whereNumber('exam')->name('exams.update');
        Route::delete('exams/{exam}', [ExamController::class, 'destroy'])->whereNumber('exam')->name('exams.destroy');
        Route::post('exams/{exam}/schedules', [ExamScheduleController::class, 'store'])->whereNumber('exam')->name('exams.schedules.store');
        Route::delete('exam-schedules/{schedule}', [ExamScheduleController::class, 'destroy'])->name('exam-schedules.destroy');
    });

    Route::get('exams/{exam}', [ExamController::class, 'show'])
        ->whereNumber('exam')->middleware('permission:view-exams')->name('exams.show');

    Route::middleware('permission:enter-results,manage-results')->group(function () {
        Route::get('exam-schedules/{schedule}/marks', [MarksController::class, 'edit'])->name('exam-schedules.marks.edit');
        Route::put('exam-schedules/{schedule}/marks', [MarksController::class, 'update'])->name('exam-schedules.marks.update');
        Route::post('exams/{exam}/report-cards', [ExamController::class, 'generateReportCards'])->whereNumber('exam')->name('exams.report-cards.generate');
    });

    // Admin Routes (Super Admin Only)
    Route::prefix('admin')->name('admin.')->group(function () {
        // Schools (Tenants) Management
        Route::resource('schools', SchoolController::class);
        Route::post('schools/{school}/toggle-status', [SchoolController::class, 'toggleStatus'])
            ->name('schools.toggle-status');

        // Users Management
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
            ->name('users.toggle-status');
        Route::post('users/{user}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::delete('users/{user}/force-delete', [UserController::class, 'forceDelete'])
            ->name('users.force-delete');

        // Subscriptions Management
        Route::get('subscriptions', [SubscriptionController::class, 'index'])
            ->name('subscriptions.index');
        Route::put('subscriptions/{tenant}', [SubscriptionController::class, 'update'])
            ->name('subscriptions.update');
        Route::post('subscriptions/{tenant}/extend', [SubscriptionController::class, 'extend'])
            ->name('subscriptions.extend');
        Route::post('subscriptions/{tenant}/cancel', [SubscriptionController::class, 'cancel'])
            ->name('subscriptions.cancel');

        // System Settings
        Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('settings/general', [SettingsController::class, 'updateGeneral'])
            ->name('settings.general');
        Route::put('settings/email', [SettingsController::class, 'updateEmail'])
            ->name('settings.email');
        Route::put('settings/features', [SettingsController::class, 'updateFeatures'])
            ->name('settings.features');
        Route::put('settings/security', [SettingsController::class, 'updateSecurity'])
            ->name('settings.security');
        Route::post('settings/clear-cache', [SettingsController::class, 'clearCache'])
            ->name('settings.clear-cache');
    });
});

require __DIR__.'/settings.php';
