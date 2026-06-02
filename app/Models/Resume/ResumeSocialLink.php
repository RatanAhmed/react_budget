<?php

namespace App\Models\Resume;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResumeSocialLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_id',
        'platform',
        'label',
        'url',
        'sort_order',
    ];

    const PLATFORMS = ['linkedin', 'github', 'twitter', 'portfolio', 'stackoverflow', 'behance', 'dribbble', 'other'];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}
