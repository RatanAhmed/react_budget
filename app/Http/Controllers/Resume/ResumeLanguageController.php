<?php

namespace App\Http\Controllers\Resume;

use App\Http\Controllers\Controller;
use App\Models\Resume\Resume;
use App\Models\Resume\ResumeLanguage;
use Illuminate\Http\Request;

class ResumeLanguageController extends Controller
{
    public function store(Request $request, Resume $resume)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'proficiency' => 'nullable|string|max:50',
            'sort_order'  => 'nullable|integer',
        ]);

        $resume->languages()->create([
            ...$validated,
            'sort_order' => $validated['sort_order'] ?? $resume->languages()->count(),
        ]);

        return back()->with('success', 'Language added.');
    }

    public function destroy(Resume $resume, ResumeLanguage $language)
    {
        $language->delete();

        return back()->with('success', 'Language removed.');
    }
}
