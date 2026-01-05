<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Expense extends Model
{
    use AuditUserActions, HasFactory;
    protected $fillable = [
        'date', 'details', 'amount', 'budget_id', 'income_id', 'category_id',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new AuthUserScope);
    }

    public function budget(){
        return $this->belongsTo(Budget::class, 'budget_id');
    }
    
    public function income(){
        return $this->belongsTo(Income::class, 'income_id');
    }
    public function category(){
        return $this->belongsTo(Category::class, 'category_id');
    }
}
