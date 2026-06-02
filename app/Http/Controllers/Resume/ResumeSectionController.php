<?php

namespace App\Http\Controllers\Resume;

use App\Http\Controllers\Controller;
use App\Models\Resume\Resume;
use App\Models\Resume\ResumeSection;
use App\Models\Resume\ResumeSectionItem;
use Illuminate\Http\Request;

class ResumeSectionController extends Controller
{
    /**
     * Add a new section to a resume.
     */
    public function store(Request $request, Resume $resume)
    {
        $validated = $request->validate([
            'type'       => 'required|in:experience,education,certification,project,volunteer,award,publication,reference,custom',
            'title'      => 'required|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $section = $resume->sections()->create([
            ...$validated,
            'is_visible' => true,
            'sort_order' => $validated['sort_order'] ?? $resume->sections()->count(),
        ]);

        return back()->with('success', 'Section added.');
    }

    /**
     * Update section title, visibility, or order.
     */
    public function update(Request $request, Resume $resume, ResumeSection $section)
    {
        $validated = $request->validate([
            'title'      => 'sometimes|required|string|max:255',
            'is_visible' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
        ]);

        $section->update($validated);

        return back()->with('success', 'Section updated.');
    }

    /**
     * Delete a section and all its items.
     */
    public function destroy(Resume $resume, ResumeSection $section)
    {
        $section->delete();

        return back()->with('success', 'Section removed.');
    }

    // ── Section Items ─────────────────────────────────────────────────────────

    /**
     * Add an item to a section.
     */
    public function storeItem(Request $request, Resume $resume, ResumeSection $section)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'subtitle'    => 'nullable|string|max:255',
            'location'    => 'nullable|string|max:255',
            'start_date'  => 'nullable|string|max:50',
            'end_date'    => 'nullable|string|max:50',
            'is_current'  => 'nullable|boolean',
            'description' => 'nullable|string',
            'url'         => 'nullable|url|max:255',
            'extra'       => 'nullable|array',
            'sort_order'  => 'nullable|integer',
        ]);

        $section->items()->create([
            ...$validated,
            'sort_order' => $validated['sort_order'] ?? $section->items()->count(),
        ]);

        return back()->with('success', 'Item added.');
    }

    /**
     * Update a section item.
     */
    public function updateItem(Request $request, Resume $resume, ResumeSection $section, ResumeSectionItem $item)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'subtitle'    => 'nullable|string|max:255',
            'location'    => 'nullable|string|max:255',
            'start_date'  => 'nullable|string|max:50',
            'end_date'    => 'nullable|string|max:50',
            'is_current'  => 'nullable|boolean',
            'description' => 'nullable|string',
            'url'         => 'nullable|url|max:255',
            'extra'       => 'nullable|array',
            'sort_order'  => 'nullable|integer',
        ]);

        $item->update($validated);

        return back()->with('success', 'Item updated.');
    }

    /**
     * Delete a section item.
     */
    public function destroyItem(Resume $resume, ResumeSection $section, ResumeSectionItem $item)
    {
        $item->delete();

        return back()->with('success', 'Item removed.');
    }
}
