<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradePoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'grading_system_id',
        'grade',
        'point',
        'min_percentage',
        'max_percentage',
        'remarks',
        'order',
    ];

    protected $casts = [
        'point' => 'decimal:2',
        'min_percentage' => 'decimal:2',
        'max_percentage' => 'decimal:2',
        'order' => 'integer',
    ];

    public function gradingSystem(): BelongsTo
    {
        return $this->belongsTo(GradingSystem::class);
    }
}
