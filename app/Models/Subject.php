<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'code',
        'description',
        'type',
        'is_optional',
        'is_active',
    ];

    protected $casts = [
        'is_optional' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function classSubjects(): HasMany
    {
        return $this->hasMany(ClassSubject::class);
    }

    public function examResults(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    /**
     * Scope to filter active subjects.
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
     * Scope to filter mandatory subjects.
     */
    public function scopeMandatory($query)
    {
        return $query->where('is_optional', false);
    }

    /**
     * Scope to filter optional subjects.
     */
    public function scopeOptional($query)
    {
        return $query->where('is_optional', true);
    }
}
