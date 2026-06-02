<?php

namespace App\Models\Resume;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResumeLanguage extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_id',
        'name',
        'proficiency',
        'sort_order',
    ];

    const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}
