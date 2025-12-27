<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'student_id',
        'class_id',
        'section_id',
        'academic_year_id',
        'date',
        'status',
        'check_in_time',
        'check_out_time',
        'marked_by',
        'remarks',
        'marked_by_user_id',
    ];

    protected $casts = [
        'date' => 'date',
        'check_in_time' => 'datetime:H:i',
        'check_out_time' => 'datetime:H:i',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
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

    public function markedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by_user_id');
    }

    /**
     * Check if student was present.
     */
    public function isPresent(): bool
    {
        return in_array($this->status, ['present', 'late']);
    }

    /**
     * Check if student was absent.
     */
    public function isAbsent(): bool
    {
        return $this->status === 'absent';
    }

    /**
     * Scope for a specific date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    /**
     * Scope for a date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope to filter by tenant.
     */
    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Scope to filter by status.
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter present students.
     */
    public function scopePresent($query)
    {
        return $query->whereIn('status', ['present', 'late']);
    }

    /**
     * Scope to filter absent students.
     */
    public function scopeAbsent($query)
    {
        return $query->where('status', 'absent');
    }
}
