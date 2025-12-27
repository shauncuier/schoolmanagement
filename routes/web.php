<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SubjectController;
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
});

require __DIR__.'/settings.php';


