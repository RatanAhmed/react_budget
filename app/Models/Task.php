<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use AuditUserActions, HasFactory;
    protected $fillable = [
        'date',
        'time',
        'details',
        'priority',
        'status',
        'remarks',
        'created_by',
        'task_categories_id',
        'is_recurring',
        'end_date',
        'end_time',
    ];

    protected $casts = [
        'is_recurring' => 'boolean',
        'date'         => 'date',
        'end_date'     => 'date',
    ];

    protected $appends = ['status_name', 'frequency_label'];

    protected $hidden = [
        'updated_by',
        'deleted_by',
        'deleted_at',
    ];

    public function category()
    {
        return $this->belongsTo(TaskCategory::class, 'task_categories_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getStatusNameAttribute()
    {
        $statusName = [
            0 => 'Pending',
            1 => 'Completed',
            2 => 'In Progress',
            3 => 'Cancelled',
        ];
        return $statusName[$this->status] ?? null;
    }

    public function getFrequencyLabelAttribute(): ?string
    {
        return $this->schedule?->frequency_label;
    }

    protected static function booted()
    {
        static::addGlobalScope(new AuthUserScope);
    }

    public function schedule()
    {
        return $this->hasOne(TaskSchedule::class);
    }
    public function logs()
    {
        return $this->hasMany(TaskLog::class);
    }
}
