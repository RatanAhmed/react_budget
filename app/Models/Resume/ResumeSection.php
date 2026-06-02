<?php

namespace App\Models\Resume;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResumeSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_id',
        'type',
        'title',
        'is_visible',
        'sort_order',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
    ];

    // Allowed section types
    const TYPES = [
        'experience',
        'education',
        'certification',
        'project',
        'volunteer',
        'award',
        'publication',
        'reference',
        'custom',
    ];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }

    public function items()
    {
        return $this->hasMany(ResumeSectionItem::class)->orderBy('sort_order');
    }
}
