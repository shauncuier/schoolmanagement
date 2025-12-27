<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id',
        'name',
        'slug',
        'email',
        'phone',
        'website',
        'logo',
        'favicon',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'primary_color',
        'secondary_color',
        'theme',
        'status',
        'subscription_plan',
        'subscription_ends_at',
        'settings',
        'data',
    ];

    /**
     * Define custom columns for the tenant model.
     * This is required by Stancl/Tenancy to map attributes to actual database columns.
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'slug',
            'email',
            'phone',
            'website',
            'logo',
            'favicon',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'primary_color',
            'secondary_color',
            'theme',
            'status',
            'subscription_plan',
            'subscription_ends_at',
            'settings',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
    }

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'settings' => 'array',
        'data' => 'array',
        'subscription_ends_at' => 'datetime',
    ];

    /**
     * Get all users belonging to this tenant.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all academic years for this tenant.
     */
    public function academicYears(): HasMany
    {
        return $this->hasMany(AcademicYear::class);
    }

    /**
     * Get the current active academic year.
     */
    public function currentAcademicYear()
    {
        return $this->academicYears()->where('is_current', true)->first();
    }

    /**
     * Check if subscription is active.
     */
    public function hasActiveSubscription(): bool
    {
        if ($this->subscription_plan === 'free') {
            return true;
        }

        return $this->subscription_ends_at && $this->subscription_ends_at->isFuture();
    }

    /**
     * Check if tenant is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get setting value by key.
     */
    public function getSetting(string $key, mixed $default = null): mixed
    {
        return data_get($this->settings, $key, $default);
    }

    /**
     * Set a setting value.
     */
    public function setSetting(string $key, mixed $value): void
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->settings = $settings;
        $this->save();
    }

    /**
     * Get the tenant's primary domain.
     */
    public function getPrimaryDomainAttribute(): ?string
    {
        return $this->domains->first()?->domain;
    }
}
