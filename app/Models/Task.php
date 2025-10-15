<?php

namespace App\Models;

use App\Traits\AuditUserActions;
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
    ];
}
