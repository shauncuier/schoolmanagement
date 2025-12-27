<?php

namespace App\Models;

use App\Traits\TenantAware;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdmissionApplication extends Model
{
    use HasFactory, TenantAware, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'application_no',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'blood_group',
        'religion',
        'nationality',
        'class_id',
        'academic_year_id',
        'previous_school',
        'previous_class',
        'previous_marks_percentage',
        'guardian_name',
        'guardian_relation',
        'guardian_email',
        'guardian_phone',
        'guardian_occupation',
        'address',
        'status',
        'interview_date',
        'admin_remarks',
        'processed_by',
        'documents',
        'photo',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'interview_date' => 'date',
        'documents' => 'array',
        'previous_marks_percentage' => 'decimal:2',
    ];

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
