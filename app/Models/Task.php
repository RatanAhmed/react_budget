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
    ];

    protected $hidden = [
        'created_at', 
        'updated_at', 
        'updated_by', 
        'deleted_by', 
        'deleted_at', 
    ];

    public function category(){
        return $this->belongsTo(TaskCategory::class, 'task_categories_id');
    }

    public function createdBy(){
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getStatusNameAttribute(){
        $statusName = [
            0 => 'Pending',
            1 => 'Completed',
            2 => 'In Progress',
            3 => 'Cancelled',
        ];
        return $statusName[$this->status] ?? null;
    }

    protected static function booted()
    {
        static::addGlobalScope(new AuthUserScope);
    }
}
