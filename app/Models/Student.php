<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'admission_no',
        'admission_date',
        'roll_number',
        'class_id',
        'section_id',
        'academic_year_id',
        'date_of_birth',
        'gender',
        'blood_group',
        'religion',
        'nationality',
        'national_id',
        'birth_certificate_no',
        'present_address',
        'permanent_address',
        'previous_school',
        'previous_class',
        'photo',
        'documents',
        'status',
        'remarks',
    ];

    protected $casts = [
        'admission_date' => 'date',
        'date_of_birth' => 'date',
        'documents' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(Guardian::class, 'student_guardian')
            ->withPivot(['relationship', 'is_emergency_contact', 'can_pickup'])
            ->withTimestamps();
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function examResults(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    public function feeAllocations(): HasMany
    {
        return $this->hasMany(StudentFeeAllocation::class);
    }

    public function feePayments(): HasMany
    {
        return $this->hasMany(FeePayment::class);
    }

    public function classHistory(): HasMany
    {
        return $this->hasMany(StudentClassHistory::class);
    }

    public function reportCards(): HasMany
    {
        return $this->hasMany(ReportCard::class);
    }

    /**
     * Get the student's name from user.
     */
    public function getNameAttribute(): string
    {
        return $this->user->name ?? '';
    }

    /**
     * Get the student's email from user.
     */
    public function getEmailAttribute(): string
    {
        return $this->user->email ?? '';
    }

    /**
     * Get primary guardian.
     */
    public function getPrimaryGuardianAttribute()
    {
        return $this->guardians()->wherePivot('is_emergency_contact', true)->first()
            ?? $this->guardians()->first();
    }

    /**
     * Get the student's age.
     */
    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth?->age;
    }

    /**
     * Get full class section string.
     */
    public function getClassSectionAttribute(): string
    {
        $class = $this->schoolClass?->name ?? '';
        $section = $this->section?->name ?? '';
        return trim("{$class} - {$section}", ' -');
    }

    /**
     * Scope to filter active students.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to filter by tenant.
     */
    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Scope to filter by class.
     */
    public function scopeInClass($query, int $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Scope to filter by section.
     */
    public function scopeInSection($query, int $sectionId)
    {
        return $query->where('section_id', $sectionId);
    }
}
