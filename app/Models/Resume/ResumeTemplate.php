<?php

namespace App\Models\Resume;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResumeTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'thumbnail',
        'category',
        'color_scheme',
        'layout',
        'font_family',
        'sections_config',
        'style_config',
        'is_active',
        'is_premium',
        'sort_order',
    ];

    protected $casts = [
        'sections_config' => 'array',
        'style_config'    => 'array',
        'is_active'       => 'boolean',
        'is_premium'      => 'boolean',
    ];

    public function resumes()
    {
        return $this->hasMany(Resume::class);
    }
}
