<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeePayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'student_id',
        'student_fee_allocation_id',
        'academic_year_id',
        'receipt_number',
        'amount',
        'late_fee',
        'total_amount',
        'payment_method',
        'transaction_id',
        'bank_name',
        'cheque_number',
        'cheque_date',
        'status',
        'remarks',
        'collected_by',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'late_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'cheque_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function allocation(): BelongsTo
    {
        return $this->belongsTo(StudentFeeAllocation::class, 'student_fee_allocation_id');
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function collector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(FeeRefund::class);
    }

    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function getPaymentMethodLabelAttribute(): string
    {
        return match($this->payment_method) {
            'cash' => 'Cash',
            'card' => 'Card',
            'bank_transfer' => 'Bank Transfer',
            'online' => 'Online',
            'cheque' => 'Cheque',
            'mobile_banking' => 'Mobile Banking',
            default => $this->payment_method,
        };
    }

    public static function generateReceiptNumber(string $tenantId): string
    {
        $lastPayment = self::where('tenant_id', $tenantId)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastPayment ? ((int) substr($lastPayment->receipt_number, -6) + 1) : 1;

        return 'RCP-' . date('Y') . '-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }
}
