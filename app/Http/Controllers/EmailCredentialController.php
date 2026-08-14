<?php

namespace App\Http\Controllers;

use App\Models\AiPlatform;
use App\Models\EmailCredential;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailCredentialController extends Controller
{
    // ── Index ─────────────────────────────────────────────────────────────────

    public function index(): Response
    {
        $credentials = EmailCredential::latest()
            ->get()
            ->map(fn (EmailCredential $c) => [
                'id'           => $c->id,
                'email'        => $c->email,
                'device_count' => $c->device_count,
                'used_with'    => $c->used_with,
                'ai_usages'    => $c->meta['ai_usages'] ?? [],   // { "Agent|YYYY": [1,3,5,...] }
                'notes'        => $c->meta['notes'] ?? null,
                'status'       => $c->status,
            ]);

        return Inertia::render('EmailCredentials/Index', [
            'credentials' => $credentials,
            'platforms'   => AiPlatform::active()->orderBy('name')->get(['id', 'name', 'category', 'token_reset']),
        ]);
    }

    // ── Store (handles both create and update) ────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        // ── Edit existing ─────────────────────────────────────────────────────
        if ($request->filled('id')) {
            $validated = $request->validate([
                'id'           => 'required|integer|exists:email_credentials,id',
                'email'        => 'required|email|max:255',
                'password'     => 'nullable|string|max:1000',
                'device_count' => 'required|integer|min:0|max:9999',
                'used_with'    => 'nullable|array',
                'used_with.*'  => 'string|max:100',
                'notes'        => 'nullable|string|max:1000',
                'status'       => 'required|boolean',
            ]);

            $credential = EmailCredential::findOrFail($validated['id']);

            // Preserve existing ai_usages — this endpoint does not touch them
            $existingMeta = $credential->meta ?? [];

            $updates = [
                'email'  => $validated['email'],
                'status' => $validated['status'],
                'meta'   => array_merge($existingMeta, [
                    'device_count' => $validated['device_count'],
                    'used_with'    => $validated['used_with'] ?? [],
                    'notes'        => $validated['notes'] ?? null,
                ]),
            ];

            if (!empty($validated['password'])) {
                $updates['password'] = $validated['password'];
            }

            $credential->update($updates);

            return redirect()->route('email-credentials.index')
                ->with('success', 'Email credential updated.');
        }

        // ── Create ────────────────────────────────────────────────────────────
        $validated = $request->validate([
            'email'        => 'required|email|max:255',
            'password'     => 'required|string|max:1000',
            'device_count' => 'required|integer|min:0|max:9999',
            'used_with'    => 'nullable|array',
            'used_with.*'  => 'string|max:100',
            'notes'        => 'nullable|string|max:1000',
            'status'       => 'required|boolean',
        ]);

        EmailCredential::create([
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'status'   => $validated['status'],
            'meta'     => [
                'device_count' => $validated['device_count'],
                'used_with'    => $validated['used_with'] ?? [],
                'ai_usages'    => [],
                'notes'        => $validated['notes'] ?? null,
            ],
        ]);

        return redirect()->route('email-credentials.index')
            ->with('success', 'Email credential saved.');
    }

    // ── Store AI monthly usages (separate endpoint) ───────────────────────────

    /**
     * Save the AI usage matrix for one credential.
     * Payload: { id, ai_usages: { "ChatGPT|2026": [1,3,5], ... } }
     * Months are stored as integers 1–12.
     */
    public function storeAiUsages(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id'         => 'required|integer|exists:email_credentials,id',
            'ai_usages'  => 'nullable|array',
            'ai_usages.*'=> 'array',
        ]);

        $credential  = EmailCredential::findOrFail($validated['id']);
        $existingMeta = $credential->meta ?? [];

        $credential->update([
            'meta' => array_merge($existingMeta, [
                'ai_usages' => $validated['ai_usages'] ?? [],
            ]),
        ]);

        return redirect()->route('email-credentials.index')
            ->with('success', 'AI usage updated.');
    }

    // ── Show password (dedicated endpoint, authenticated + owner-checked) ─────

    public function showPassword(EmailCredential $emailCredential): \Illuminate\Http\JsonResponse
    {
        // withoutGlobalScopes is not needed — the global scope already ensures
        // only the authenticated owner can resolve this model.
        return response()->json(['password' => $emailCredential->password]);
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function destroy(EmailCredential $emailCredential): RedirectResponse
    {
        $emailCredential->delete();

        return redirect()->route('email-credentials.index')
            ->with('success', 'Email credential deleted.');
    }
}
