<?php

namespace App\Models\Resume;

use App\Traits\AuditUserActions;
use App\Models\Scopes\AuthUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Resume extends Model
{
    use AuditUserActions, HasFactory;

    protected $fillable = [
        'resume_template_id',
        'title',
        'slug',
        'full_name',
        'job_title',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'website',
        'photo',
        'summary',
        'status',
        'is_public',
        'custom_style',
    ];

    protected $casts = [
        'is_public'    => 'boolean',
        'custom_style' => 'array',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new AuthUserScope);
    }

    public function template()
    {
        return $this->belongsTo(ResumeTemplate::class, 'resume_template_id');
    }

    public function sections()
    {
        return $this->hasMany(ResumeSection::class)->orderBy('sort_order');
    }

    public function skills()
    {
        return $this->hasMany(ResumeSkill::class)->orderBy('sort_order');
    }

    public function languages()
    {
        return $this->hasMany(ResumeLanguage::class)->orderBy('sort_order');
    }

    public function socialLinks()
    {
        return $this->hasMany(ResumeSocialLink::class)->orderBy('sort_order');
    }
}
