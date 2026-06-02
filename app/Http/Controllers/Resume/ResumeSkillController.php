<?php

namespace App\Http\Controllers\Resume;

use App\Http\Controllers\Controller;
use App\Models\Resume\Resume;
use App\Models\Resume\ResumeSkill;
use Illuminate\Http\Request;

class ResumeSkillController extends Controller
{
    public function store(Request $request, Resume $resume)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:100',
            'category'   => 'nullable|string|max:100',
            'level'      => 'nullable|integer|min:0|max:5',
            'sort_order' => 'nullable|integer',
        ]);

        $resume->skills()->create([
            ...$validated,
            'sort_order' => $validated['sort_order'] ?? $resume->skills()->count(),
        ]);

        return back()->with('success', 'Skill added.');
    }

    public function update(Request $request, Resume $resume, ResumeSkill $skill)
    {
        $validated = $request->validate([
            'name'       => 'sometimes|required|string|max:100',
            'category'   => 'nullable|string|max:100',
            'level'      => 'nullable|integer|min:0|max:5',
            'sort_order' => 'nullable|integer',
        ]);

        $skill->update($validated);

        return back()->with('success', 'Skill updated.');
    }

    public function destroy(Resume $resume, ResumeSkill $skill)
    {
        $skill->delete();

        return back()->with('success', 'Skill removed.');
    }

    /**
     * Bulk replace all skills for a resume (used by the builder's skill editor).
     */
    public function bulkSync(Request $request, Resume $resume)
    {
        $validated = $request->validate([
            'skills'             => 'required|array',
            'skills.*.name'      => 'required|string|max:100',
            'skills.*.category'  => 'nullable|string|max:100',
            'skills.*.level'     => 'nullable|integer|min:0|max:5',
        ]);

        $resume->skills()->delete();

        foreach ($validated['skills'] as $index => $skill) {
            $resume->skills()->create([...$skill, 'sort_order' => $index]);
        }

        return back()->with('success', 'Skills saved.');
    }
}
