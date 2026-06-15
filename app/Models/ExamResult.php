<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'exam_id',
        'exam_schedule_id',
        'student_id',
        'subject_id',
        'marks_obtained',
        'practical_marks',
        'grade',
        'grade_point',
        'is_absent',
        'remarks',
        'entered_by',
    ];

    protected $casts = [
        'marks_obtained' => 'decimal:2',
        'practical_marks' => 'decimal:2',
        'grade_point' => 'decimal:2',
        'is_absent' => 'boolean',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function examSchedule(): BelongsTo
    {
        return $this->belongsTo(ExamSchedule::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}
