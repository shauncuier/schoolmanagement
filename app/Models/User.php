<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'phone',
        'password',
        'avatar',
        'status',
        'last_login_at',
        'last_login_ip',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Get the tenant (school) that the user belongs to.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the student profile if user is a student.
     */
    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    /**
     * Get the teacher profile if user is a teacher.
     */
    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    /**
     * Get the parent profile if user is a parent.
     */
    public function guardian(): HasOne
    {
        return $this->hasOne(Guardian::class);
    }

    /**
     * Check if user is a super admin (platform level).
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }

    /**
     * Check if user belongs to given tenant.
     */
    public function belongsToTenant(string $tenantId): bool
    {
        return $this->tenant_id === $tenantId;
    }

    /**
     * Get user's full display name with role.
     */
    public function getDisplayNameAttribute(): string
    {
        $role = $this->roles->first()?->name ?? 'User';
        return "{$this->name} ({$role})";
    }
}
