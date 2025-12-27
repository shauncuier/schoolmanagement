<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Section extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'class_id',
        'academic_year_id',
        'name',
        'capacity',
        'class_teacher_id',
        'room_number',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'is_active' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'class_teacher_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function timetables(): HasMany
    {
        return $this->hasMany(Timetable::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the full section name (e.g., "Class 5 - Section A")
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->schoolClass->name} - {$this->name}";
    }

    /**
     * Get current student count.
     */
    public function getCurrentStrengthAttribute(): int
    {
        return $this->students()->where('status', 'active')->count();
    }

    /**
     * Check if section has available seats.
     */
    public function hasAvailableSeats(): bool
    {
        return $this->current_strength < $this->capacity;
    }

    /**
     * Scope to filter active sections.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by tenant.
     */
    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}
