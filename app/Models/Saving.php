<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Saving extends Model
{
    use HasFactory;
    protected $fillable = [
        'date', 'details', 'amount', 'budget_id', 'income_id', 'saving_for'
    ];
}
