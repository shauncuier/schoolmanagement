<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'student_id',
        'exam_id',
        'class_id',
        'section_id',
        'total_marks',
        'obtained_marks',
        'percentage',
        'gpa',
        'grade',
        'rank',
        'total_students',
        'result',
        'remarks',
        'teacher_comments',
        'principal_comments',
        'is_published',
    ];

    protected $casts = [
        'total_marks' => 'decimal:2',
        'obtained_marks' => 'decimal:2',
        'percentage' => 'decimal:2',
        'gpa' => 'decimal:2',
        'rank' => 'integer',
        'total_students' => 'integer',
        'is_published' => 'boolean',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
