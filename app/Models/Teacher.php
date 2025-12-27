<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'employee_id',
        'designation',
        'department',
        'joining_date',
        'qualification',
        'specialization',
        'salary',
        'employment_type',
        'subjects_can_teach',
        'is_active',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'salary' => 'decimal:2',
        'subjects_can_teach' => 'array',
        'is_active' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subjectAssignments(): HasMany
    {
        return $this->hasMany(TeacherSubjectAssignment::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(TeacherAttendance::class);
    }

    public function classesTaught(): HasMany
    {
        return $this->hasMany(Section::class, 'class_teacher_id', 'user_id');
    }

    /**
     * Get the teacher's name from user.
     */
    public function getNameAttribute(): string
    {
        return $this->user->name ?? '';
    }

    /**
     * Get the teacher's email from user.
     */
    public function getEmailAttribute(): string
    {
        return $this->user->email ?? '';
    }

    /**
     * Scope to filter active teachers.
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

    /**
     * Scope to filter by employment type.
     */
    public function scopeFullTime($query)
    {
        return $query->where('employment_type', 'full-time');
    }
}
