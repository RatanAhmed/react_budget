<?php

namespace App\Models\Resume;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResumeSectionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_section_id',
        'title',
        'subtitle',
        'location',
        'start_date',
        'end_date',
        'is_current',
        'description',
        'url',
        'extra',
        'sort_order',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'extra'      => 'array',
    ];

    public function section()
    {
        return $this->belongsTo(ResumeSection::class, 'resume_section_id');
    }
}
