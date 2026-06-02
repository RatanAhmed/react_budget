<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'log_date',
        'status',
        'remarks',
        'created_by',
    ];

    protected $casts = [
        'log_date' => 'date',
        'status'   => 'integer',
    ];

    // Status constants
    const STATUS_PENDING    = 0;
    const STATUS_DONE       = 1;
    const STATUS_PROCESSING = 2;
    const STATUS_SKIPPED    = 3;

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function getStatusNameAttribute(): string
    {
        return match ($this->status) {
            1 => 'Done',
            2 => 'Processing',
            3 => 'Skipped',
            default => 'Pending',
        };
    }
}
