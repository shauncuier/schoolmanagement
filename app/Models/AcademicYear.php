<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicYear extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'start_date',
        'end_date',
        'is_current',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Set this year as current and unset others.
     */
    public function setAsCurrent(): void
    {
        static::where('tenant_id', $this->tenant_id)
            ->where('id', '!=', $this->id)
            ->update(['is_current' => false]);

        $this->update(['is_current' => true, 'status' => 'active']);
    }

    /**
     * Scope to get current academic year.
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Scope to filter by tenant.
     */
    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}
