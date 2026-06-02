<?php

namespace App\Http\Controllers\Resume;

use App\Http\Controllers\Controller;
use App\Models\Resume\Resume;
use App\Models\Resume\ResumeSocialLink;
use Illuminate\Http\Request;

class ResumeSocialLinkController extends Controller
{
    public function store(Request $request, Resume $resume)
    {
        $validated = $request->validate([
            'platform'   => 'required|string|max:50',
            'url'        => 'required|url|max:255',
            'label'      => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer',
        ]);

        $resume->socialLinks()->create([
            ...$validated,
            'sort_order' => $validated['sort_order'] ?? $resume->socialLinks()->count(),
        ]);

        return back()->with('success', 'Social link added.');
    }

    public function destroy(Resume $resume, ResumeSocialLink $link)
    {
        $link->delete();

        return back()->with('success', 'Social link removed.');
    }
}
