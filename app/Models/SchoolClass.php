<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolClass extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes';

    protected $fillable = [
        'tenant_id',
        'name',
        'numeric_name',
        'description',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class, 'class_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(ClassSubject::class, 'class_id');
    }

    public function feeStructures(): HasMany
    {
        return $this->hasMany(FeeStructure::class, 'class_id');
    }

    /**
     * Scope to filter active classes.
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
     * Scope to order by class order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('numeric_name');
    }
}
