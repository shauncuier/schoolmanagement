<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'title',
        'content',
        'type',
        'audience',
        'class_id',
        'attachment',
        'publish_date',
        'expiry_date',
        'is_published',
        'send_notification',
        'created_by',
    ];

    protected $casts = [
        'publish_date' => 'date',
        'expiry_date' => 'date',
        'is_published' => 'boolean',
        'send_notification' => 'boolean',
    ];

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
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
