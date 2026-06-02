<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResumeTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            // ── 1. Modern Professional ────────────────────────────────────────
            [
                'name'         => 'Modern Professional',
                'slug'         => 'modern-professional',
                'description'  => 'Clean two-column layout with a bold header. Perfect for software engineers and corporate roles.',
                'thumbnail'    => '/images/resume-templates/modern-professional.png',
                'category'     => 'professional',
                'color_scheme' => 'blue',
                'layout'       => 'two-column',
                'font_family'  => 'Inter',
                'is_premium'   => false,
                'sort_order'   => 1,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'experience',    'title' => 'Work Experience'],
                        ['type' => 'education',     'title' => 'Education'],
                        ['type' => 'certification', 'title' => 'Certifications'],
                        ['type' => 'project',       'title' => 'Projects'],
                    ],
                    'sidebar_sections' => ['skills', 'languages', 'social_links'],
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#2563EB',
                    'header_bg'      => '#1E3A5F',
                    'header_text'    => '#FFFFFF',
                    'sidebar_bg'     => '#F1F5F9',
                    'font_size_base' => '14px',
                    'line_height'    => '1.6',
                ]),
            ],

            // ── 2. Minimal Clean ──────────────────────────────────────────────
            [
                'name'         => 'Minimal Clean',
                'slug'         => 'minimal-clean',
                'description'  => 'Single-column, whitespace-driven design. Lets your content breathe. Great for any industry.',
                'thumbnail'    => '/images/resume-templates/minimal-clean.png',
                'category'     => 'minimal',
                'color_scheme' => 'gray',
                'layout'       => 'single-column',
                'font_family'  => 'Lato',
                'is_premium'   => false,
                'sort_order'   => 2,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'experience', 'title' => 'Experience'],
                        ['type' => 'education',  'title' => 'Education'],
                        ['type' => 'project',    'title' => 'Projects'],
                    ],
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#374151',
                    'header_bg'      => '#FFFFFF',
                    'header_text'    => '#111827',
                    'divider_color'  => '#E5E7EB',
                    'font_size_base' => '13px',
                    'line_height'    => '1.7',
                ]),
            ],

            // ── 3. Creative Portfolio ─────────────────────────────────────────
            [
                'name'         => 'Creative Portfolio',
                'slug'         => 'creative-portfolio',
                'description'  => 'Bold sidebar with photo, vibrant accent colors. Ideal for designers, marketers, and creatives.',
                'thumbnail'    => '/images/resume-templates/creative-portfolio.png',
                'category'     => 'creative',
                'color_scheme' => 'purple',
                'layout'       => 'sidebar-left',
                'font_family'  => 'Poppins',
                'is_premium'   => false,
                'sort_order'   => 3,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'experience', 'title' => 'Experience'],
                        ['type' => 'education',  'title' => 'Education'],
                        ['type' => 'project',    'title' => 'Portfolio'],
                    ],
                    'sidebar_sections' => ['skills', 'languages', 'social_links'],
                    'show_photo'       => true,
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#7C3AED',
                    'sidebar_bg'     => '#7C3AED',
                    'sidebar_text'   => '#FFFFFF',
                    'font_size_base' => '13px',
                    'line_height'    => '1.6',
                ]),
            ],

            // ── 4. Executive Elite ────────────────────────────────────────────
            [
                'name'         => 'Executive Elite',
                'slug'         => 'executive-elite',
                'description'  => 'Sophisticated dark header with serif typography. Built for senior management and C-suite roles.',
                'thumbnail'    => '/images/resume-templates/executive-elite.png',
                'category'     => 'executive',
                'color_scheme' => 'dark',
                'layout'       => 'single-column',
                'font_family'  => 'Merriweather',
                'is_premium'   => true,
                'sort_order'   => 4,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'experience',    'title' => 'Professional Experience'],
                        ['type' => 'education',     'title' => 'Education'],
                        ['type' => 'certification', 'title' => 'Certifications & Awards'],
                    ],
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#B45309',
                    'header_bg'      => '#111827',
                    'header_text'    => '#F9FAFB',
                    'section_title'  => '#111827',
                    'font_size_base' => '14px',
                    'line_height'    => '1.8',
                ]),
            ],

            // ── 5. Academic Scholar ───────────────────────────────────────────
            [
                'name'         => 'Academic Scholar',
                'slug'         => 'academic-scholar',
                'description'  => 'Traditional CV format with publications, research, and references sections. Ideal for academia.',
                'thumbnail'    => '/images/resume-templates/academic-scholar.png',
                'category'     => 'academic',
                'color_scheme' => 'green',
                'layout'       => 'single-column',
                'font_family'  => 'Georgia',
                'is_premium'   => false,
                'sort_order'   => 5,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'education',    'title' => 'Education'],
                        ['type' => 'experience',   'title' => 'Research Experience'],
                        ['type' => 'publication',  'title' => 'Publications'],
                        ['type' => 'award',        'title' => 'Awards & Honors'],
                        ['type' => 'reference',    'title' => 'References'],
                    ],
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#065F46',
                    'header_bg'      => '#ECFDF5',
                    'header_text'    => '#065F46',
                    'font_size_base' => '13px',
                    'line_height'    => '1.8',
                ]),
            ],

            // ── 6. Tech Developer ─────────────────────────────────────────────
            [
                'name'         => 'Tech Developer',
                'slug'         => 'tech-developer',
                'description'  => 'Dark-mode inspired design with code-style accents. Built for developers and engineers.',
                'thumbnail'    => '/images/resume-templates/tech-developer.png',
                'category'     => 'professional',
                'color_scheme' => 'teal',
                'layout'       => 'two-column',
                'font_family'  => 'JetBrains Mono',
                'is_premium'   => false,
                'sort_order'   => 6,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'experience',    'title' => 'Experience'],
                        ['type' => 'project',       'title' => 'Open Source & Projects'],
                        ['type' => 'education',     'title' => 'Education'],
                        ['type' => 'certification', 'title' => 'Certifications'],
                    ],
                    'sidebar_sections' => ['skills', 'languages', 'social_links'],
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#0D9488',
                    'header_bg'      => '#0F172A',
                    'header_text'    => '#F8FAFC',
                    'sidebar_bg'     => '#1E293B',
                    'sidebar_text'   => '#CBD5E1',
                    'font_size_base' => '13px',
                    'line_height'    => '1.6',
                ]),
            ],

            // ── 7. Elegant Sidebar ────────────────────────────────────────────
            [
                'name'         => 'Elegant Sidebar',
                'slug'         => 'elegant-sidebar',
                'description'  => 'Right-side sidebar with soft pastel tones. Balanced and professional for any field.',
                'thumbnail'    => '/images/resume-templates/elegant-sidebar.png',
                'category'     => 'professional',
                'color_scheme' => 'rose',
                'layout'       => 'sidebar-right',
                'font_family'  => 'Nunito',
                'is_premium'   => false,
                'sort_order'   => 7,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'experience', 'title' => 'Work Experience'],
                        ['type' => 'education',  'title' => 'Education'],
                        ['type' => 'project',    'title' => 'Projects'],
                    ],
                    'sidebar_sections' => ['skills', 'languages', 'social_links'],
                    'show_photo'       => true,
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#E11D48',
                    'sidebar_bg'     => '#FFF1F2',
                    'sidebar_text'   => '#881337',
                    'font_size_base' => '13px',
                    'line_height'    => '1.7',
                ]),
            ],

            // ── 8. Compact Timeline ───────────────────────────────────────────
            [
                'name'         => 'Compact Timeline',
                'slug'         => 'compact-timeline',
                'description'  => 'Timeline-style experience section with a compact single-column layout. Great for dense CVs.',
                'thumbnail'    => '/images/resume-templates/compact-timeline.png',
                'category'     => 'minimal',
                'color_scheme' => 'indigo',
                'layout'       => 'single-column',
                'font_family'  => 'Roboto',
                'is_premium'   => false,
                'sort_order'   => 8,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'experience',    'title' => 'Career Timeline'],
                        ['type' => 'education',     'title' => 'Education'],
                        ['type' => 'certification', 'title' => 'Certifications'],
                        ['type' => 'volunteer',     'title' => 'Volunteer Work'],
                    ],
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#4338CA',
                    'timeline_color' => '#C7D2FE',
                    'header_bg'      => '#EEF2FF',
                    'header_text'    => '#312E81',
                    'font_size_base' => '12px',
                    'line_height'    => '1.6',
                ]),
            ],

            // ── 9. Infographic Visual ─────────────────────────────────────────
            [
                'name'         => 'Infographic Visual',
                'slug'         => 'infographic-visual',
                'description'  => 'Skill bars, icon badges, and visual progress indicators. Stand out in creative industries.',
                'thumbnail'    => '/images/resume-templates/infographic-visual.png',
                'category'     => 'creative',
                'color_scheme' => 'orange',
                'layout'       => 'two-column',
                'font_family'  => 'Montserrat',
                'is_premium'   => true,
                'sort_order'   => 9,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'experience', 'title' => 'Experience'],
                        ['type' => 'education',  'title' => 'Education'],
                        ['type' => 'project',    'title' => 'Projects'],
                    ],
                    'sidebar_sections'  => ['skills', 'languages', 'social_links'],
                    'show_skill_bars'   => true,
                    'show_photo'        => true,
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#EA580C',
                    'header_bg'      => '#EA580C',
                    'header_text'    => '#FFFFFF',
                    'sidebar_bg'     => '#FFF7ED',
                    'skill_bar_color'=> '#EA580C',
                    'font_size_base' => '13px',
                    'line_height'    => '1.6',
                ]),
            ],

            // ── 10. ATS Friendly ──────────────────────────────────────────────
            [
                'name'         => 'ATS Friendly',
                'slug'         => 'ats-friendly',
                'description'  => 'Plain, structured layout optimized for Applicant Tracking Systems. Maximum keyword visibility.',
                'thumbnail'    => '/images/resume-templates/ats-friendly.png',
                'category'     => 'minimal',
                'color_scheme' => 'black',
                'layout'       => 'single-column',
                'font_family'  => 'Arial',
                'is_premium'   => false,
                'sort_order'   => 10,
                'sections_config' => json_encode([
                    'default_sections' => [
                        ['type' => 'experience',    'title' => 'Professional Experience'],
                        ['type' => 'education',     'title' => 'Education'],
                        ['type' => 'certification', 'title' => 'Certifications'],
                        ['type' => 'project',       'title' => 'Key Projects'],
                        ['type' => 'volunteer',     'title' => 'Volunteer Experience'],
                    ],
                ]),
                'style_config' => json_encode([
                    'accent_color'   => '#000000',
                    'header_bg'      => '#FFFFFF',
                    'header_text'    => '#000000',
                    'divider_color'  => '#000000',
                    'font_size_base' => '12px',
                    'line_height'    => '1.5',
                    'no_colors'      => true,
                ]),
            ],
        ];

        foreach ($templates as $template) {
            DB::table('resume_templates')->updateOrInsert(
                ['slug' => $template['slug']],
                array_merge($template, [
                    'is_active'  => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
