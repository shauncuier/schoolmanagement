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
    });
});

require __DIR__.'/settings.php';
