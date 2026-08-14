<?php

namespace App\Http\Controllers;

use App\Models\AiPlatform;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiPlatformController extends Controller
{
    // ── Index ─────────────────────────────────────────────────────────────────

    public function index(): Response
    {
        return Inertia::render('AiPlatforms/Index', [
            'platforms' => AiPlatform::orderBy('name')->get(),
        ]);
    }

    // ── Store (create + update) ───────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        // Edit existing
        if ($request->filled('id')) {
            $validated = $request->validate([
                'id'          => 'required|integer|exists:ai_platforms,id',
                'name'        => 'required|string|max:100',
                'website'     => 'nullable|url|max:255',
                'category'    => 'nullable|string|max:50',
                'token_reset' => 'required|in:monthly,weekly,daily,none',
                'description' => 'nullable|string|max:500',
                'status'      => 'required|boolean',
            ]);

            AiPlatform::findOrFail($validated['id'])->update([
                'name'        => $validated['name'],
                'website'     => $validated['website']     ?? null,
                'category'    => $validated['category']    ?? null,
                'token_reset' => $validated['token_reset'],
                'description' => $validated['description'] ?? null,
                'status'      => $validated['status'],
            ]);

            return redirect()->route('ai-platforms.index')
                ->with('success', 'AI platform updated.');
        }

        // Create
        $validated = $request->validate([
            'name'        => 'required|string|max:100|unique:ai_platforms,name',
            'website'     => 'nullable|url|max:255',
            'category'    => 'nullable|string|max:50',
            'token_reset' => 'required|in:monthly,weekly,daily,none',
            'description' => 'nullable|string|max:500',
            'status'      => 'required|boolean',
        ]);

        AiPlatform::create($validated);

        return redirect()->route('ai-platforms.index')
            ->with('success', 'AI platform added.');
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function destroy(AiPlatform $aiPlatform): RedirectResponse
    {
        $aiPlatform->delete();

        return redirect()->route('ai-platforms.index')
            ->with('success', 'AI platform deleted.');
    }

    // ── New agents discovery (JSON) ───────────────────────────────────────────

    /**
     * Returns recently launched AI agents with free-tier info,
     * excluding any already in the database.
     *
     * GET /ai-platforms/new-agents?category=&q=&free_only=1
     */
    public function newAgents(Request $request): JsonResponse
    {
        $q        = strtolower(trim($request->get('q', '')));
        $category = $request->get('category', '');
        $freeOnly = $request->boolean('free_only');

        $existing = AiPlatform::withoutGlobalScopes()
            ->pluck('name')
            ->map(fn($n) => strtolower($n))
            ->toArray();

        $list = collect(AiPlatform::newlyLaunched())
            // Exclude platforms already saved
            ->filter(fn($p) => !in_array(strtolower($p['name']), $existing, true))
            ->when($q,        fn($c) => $c->filter(fn($p) => str_contains(strtolower($p['name']), $q) || str_contains(strtolower($p['description'] ?? ''), $q)))
            ->when($category, fn($c) => $c->filter(fn($p) => ($p['category'] ?? '') === $category))
            ->when($freeOnly, fn($c) => $c->filter(fn($p) => $p['free_tier'] === true))
            ->values();

        return response()->json($list);
    }

    // ── Suggestions (JSON, used by the form typeahead) ────────────────────────

    /**
     * Returns well-known AI platforms that are NOT yet in the database,
     * optionally filtered by a search term.
     *
     * GET /ai-platforms/suggestions?q=run
     */
    public function suggestions(Request $request): JsonResponse
    {
        $query     = strtolower(trim($request->get('q', '')));
        $existing  = AiPlatform::withoutGlobalScopes()->pluck('name')->map(fn($n) => strtolower($n))->toArray();

        $suggestions = collect(AiPlatform::wellKnown())
            ->filter(fn($p) => !in_array(strtolower($p['name']), $existing, true))
            ->when($query !== '', fn($c) =>
                $c->filter(fn($p) => str_contains(strtolower($p['name']), $query))
            )
            ->values();

        return response()->json($suggestions);
    }
}
