<?php

namespace App\Models\Resume;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResumeSkill extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_id',
        'name',
        'category',
        'level',
        'sort_order',
    ];

    protected $casts = [
        'level' => 'integer',
    ];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}
