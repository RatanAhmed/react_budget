<?php

namespace App\Http\Controllers\Resume;

use App\Http\Controllers\Controller;
use App\Models\Resume\ResumeTemplate;
use Inertia\Inertia;
use Inertia\Response;

class ResumeTemplateController extends Controller
{
    /**
     * List all active templates for the template picker.
     */
    public function index(): Response
    {
        $templates = ResumeTemplate::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'description', 'thumbnail', 'category', 'color_scheme', 'layout', 'is_premium']);

        return Inertia::render('Resume/Templates/Index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Preview a single template with dummy data.
     */
    public function preview(ResumeTemplate $template): Response
    {
        return Inertia::render('Resume/Templates/Preview', [
            'template' => $template,
        ]);
    }
}
