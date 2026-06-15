<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentIntent extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'student_fee_allocation_id',
        'student_id',
        'gateway',
        'reference',
        'amount',
        'currency',
        'status',
        'gateway_transaction_id',
        'payload',
        'fee_payment_id',
        'expires_at',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payload' => 'array',
        'expires_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function allocation(): BelongsTo
    {
        return $this->belongsTo(StudentFeeAllocation::class, 'student_fee_allocation_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function feePayment(): BelongsTo
    {
        return $this->belongsTo(FeePayment::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }
}
