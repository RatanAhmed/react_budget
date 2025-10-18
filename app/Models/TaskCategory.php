<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TaskCategory extends Model
{
    use HasFactory;
    use AuditUserActions, HasFactory;
    protected $fillable = [
        'name', 
        'status', 
        'created_by', 
    ];

    protected $hidden = [
        'created_at', 
        'updated_at', 
        'updated_by', 
        'deleted_by', 
        'deleted_at', 
    ];
}
