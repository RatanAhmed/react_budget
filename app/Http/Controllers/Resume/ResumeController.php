<?php

namespace App\Http\Controllers\Resume;

use App\Http\Controllers\Controller;
use App\Models\Resume\Resume;
use App\Models\Resume\ResumeSection;
use App\Models\Resume\ResumeTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ResumeController extends Controller
{
    /**
     * List all resumes for the authenticated user.
     */
    public function index(): Response
    {
        $resumes = Resume::with('template:id,name,slug,thumbnail,color_scheme,layout')
            ->latest()
            ->get(['id', 'resume_template_id', 'title', 'slug', 'full_name', 'job_title', 'status', 'is_public', 'created_at']);

        return Inertia::render('Resume/Index', [
            'resumes' => $resumes,
        ]);
    }

    /**
     * Show the resume builder/editor for a specific resume.
     */
    public function edit(Resume $resume): Response
    {
        $resume->load([
            'template',
            'sections.items',
            'skills',
            'languages',
            'socialLinks',
        ]);

        return Inertia::render('Resume/Builder', [
            'resume' => $resume,
        ]);
    }

    /**
     * Create a new resume from a chosen template.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'resume_template_id' => 'required|exists:resume_templates,id',
            'title'              => 'required|string|max:255',
            'full_name'          => 'required|string|max:255',
            'job_title'          => 'nullable|string|max:255',
            'email'              => 'nullable|email|max:255',
            'phone'              => 'nullable|string|max:50',
        ]);

        $resume = Resume::create([
            ...$validated,
            'slug'   => Str::slug($validated['title']) . '-' . Str::random(6),
            'status' => 'draft',
        ]);

        // Seed default sections based on template config
        $template = ResumeTemplate::find($validated['resume_template_id']);
        $defaultSections = $template->sections_config['default_sections'] ?? [
            ['type' => 'experience',    'title' => 'Work Experience'],
            ['type' => 'education',     'title' => 'Education'],
            ['type' => 'certification', 'title' => 'Certifications'],
            ['type' => 'project',       'title' => 'Projects'],
        ];

        foreach ($defaultSections as $index => $section) {
            ResumeSection::create([
                'resume_id'  => $resume->id,
                'type'       => $section['type'],
                'title'      => $section['title'],
                'is_visible' => true,
                'sort_order' => $index,
            ]);
        }

        return redirect()->route('resume.edit', $resume)->with('success', 'Resume created. Start building!');
    }

    /**
     * Update personal info and meta fields.
     */
    public function update(Request $request, Resume $resume)
    {
        $validated = $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'full_name'    => 'sometimes|required|string|max:255',
            'job_title'    => 'nullable|string|max:255',
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:50',
            'address'      => 'nullable|string|max:255',
            'city'         => 'nullable|string|max:100',
            'country'      => 'nullable|string|max:100',
            'website'      => 'nullable|url|max:255',
            'summary'      => 'nullable|string',
            'status'       => 'nullable|in:draft,published,archived',
            'is_public'    => 'nullable|boolean',
            'custom_style' => 'nullable|array',
        ]);

        $resume->update($validated);

        return back()->with('success', 'Resume updated.');
    }

    /**
     * Soft-delete a resume.
     */
    public function destroy(Resume $resume)
    {
        $resume->delete();

        return redirect()->route('resume.index')->with('success', 'Resume deleted.');
    }

    /**
     * Public shareable view (no auth required if is_public).
     */
    public function publicView(string $slug): Response
    {
        $resume = Resume::withoutGlobalScopes()
            ->where('slug', $slug)
            ->where('is_public', true)
            ->where('status', 'published')
            ->with(['template', 'sections.items', 'skills', 'languages', 'socialLinks'])
            ->firstOrFail();

        return Inertia::render('Resume/PublicView', [
            'resume' => $resume,
        ]);
    }

    /**
     * Change the template of an existing resume.
     */
    public function changeTemplate(Request $request, Resume $resume)
    {
        $validated = $request->validate([
            'resume_template_id' => 'required|exists:resume_templates,id',
        ]);

        $resume->update(['resume_template_id' => $validated['resume_template_id']]);

        return back()->with('success', 'Template changed.');
    }
}
