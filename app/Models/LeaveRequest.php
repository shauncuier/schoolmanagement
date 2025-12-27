<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'requestable_type',
        'requestable_id',
        'academic_year_id',
        'leave_type',
        'start_date',
        'end_date',
        'total_days',
        'reason',
        'supporting_document',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_remarks',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function requestable(): MorphTo
    {
        return $this->morphTo();
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Scopes
    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // Helpers
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function getRequesterNameAttribute(): string
    {
        if ($this->requestable_type === Student::class) {
            return $this->requestable->first_name . ' ' . $this->requestable->last_name;
        }
        return $this->requestable->name ?? 'Unknown';
    }

    public function getRequesterTypeAttribute(): string
    {
        return match ($this->requestable_type) {
            Student::class => 'Student',
            User::class => 'Staff',
            default => 'Unknown',
        };
    }

    public static function leaveTypes(): array
    {
        return [
            'sick' => 'Sick Leave',
            'personal' => 'Personal Leave',
            'family' => 'Family Emergency',
            'vacation' => 'Vacation',
            'medical' => 'Medical Appointment',
            'other' => 'Other',
        ];
    }
}
