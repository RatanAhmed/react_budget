<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        $accounts = Account::withoutGlobalScopes()
            ->where('created_by', auth()->id())
            ->with('transactions')
            ->get()
            ->map(fn (Account $a) => [
                'id'              => $a->id,
                'name'            => $a->name,
                'type'            => $a->type,
                'currency'        => $a->currency,
                'opening_balance' => (float) $a->opening_balance,
                'balance'         => $a->balance,
                'is_default'      => $a->is_default,
                'color'           => $a->color,
                'status'          => $a->status,
            ]);

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $typeRule = 'required|in:cash,bank,savings,credit,investment';

        // Handle edit
        if ($request->filled('id')) {
            $validated = $request->validate([
                'id'              => 'required|numeric|exists:accounts,id',
                'name'            => 'required|string|max:150',
                'type'            => $typeRule,
                'currency'        => 'required|string|max:10',
                'opening_balance' => 'required|numeric',
                'is_default'      => 'boolean',
                'color'           => 'nullable|string|max:20',
                'status'          => 'boolean',
            ]);

            $account = Account::find($validated['id']);
            $account->update([
                'name'            => $validated['name'],
                'type'            => $validated['type'],
                'currency'        => $validated['currency'],
                'opening_balance' => $validated['opening_balance'],
                'is_default'      => $validated['is_default'] ?? false,
                'color'           => $validated['color'] ?? null,
                'status'          => $validated['status'] ?? true,
            ]);

            // If set as default, unset all others
            if ($validated['is_default'] ?? false) {
                Account::withoutGlobalScopes()
                    ->where('created_by', auth()->id())
                    ->where('id', '!=', $account->id)
                    ->update(['is_default' => false]);
            }

            return back()->with('success', 'Account updated.');
        }

        // Create
        $validated = $request->validate([
            'name'            => 'required|string|max:150',
            'type'            => $typeRule,
            'currency'        => 'nullable|string|max:10',
            'opening_balance' => 'nullable|numeric',
            'is_default'      => 'boolean',
            'color'           => 'nullable|string|max:20',
            'status'          => 'boolean',
        ]);

        $account = Account::create([
            'name'            => $validated['name'],
            'type'            => $validated['type'],
            'currency'        => $validated['currency'] ?? 'BDT',
            'opening_balance' => $validated['opening_balance'] ?? 0,
            'is_default'      => $validated['is_default'] ?? false,
            'color'           => $validated['color'] ?? null,
            'status'          => $validated['status'] ?? true,
        ]);

        // If set as default, unset all others
        if ($validated['is_default'] ?? false) {
            Account::withoutGlobalScopes()
                ->where('created_by', auth()->id())
                ->where('id', '!=', $account->id)
                ->update(['is_default' => false]);
        }

        return back()->with('success', 'Account created.');
    }

    public function storeBulk(Request $request): RedirectResponse
    {
        $request->validate([
            'accounts'                   => 'required|array|min:1',
            'accounts.*.name'            => 'required|string|max:150',
            'accounts.*.type'            => 'required|in:cash,bank,savings,credit,investment',
            'accounts.*.currency'        => 'nullable|string|max:10',
            'accounts.*.opening_balance' => 'nullable|numeric',
            'accounts.*.color'           => 'nullable|string|max:20',
            'is_default_index'           => 'nullable|integer|min:0',
        ]);

        $defaultIndex = $request->input('is_default_index', 0);

        // If setting a new default, unset existing ones first
        Account::withoutGlobalScopes()
            ->where('created_by', auth()->id())
            ->update(['is_default' => false]);

        foreach ($request->accounts as $i => $row) {
            Account::create([
                'name'            => $row['name'],
                'type'            => $row['type'],
                'currency'        => $row['currency'] ?? 'BDT',
                'opening_balance' => $row['opening_balance'] ?? 0,
                'is_default'      => ($i === (int) $defaultIndex),
                'color'           => $row['color'] ?? '#6366f1',
                'status'          => true,
            ]);
        }

        return back()->with('success', count($request->accounts) . ' account(s) created.');
    }

    public function destroy(Account $account): RedirectResponse
    {
        // Prevent deleting account that still has transactions
        if ($account->transactions()->count() > 0) {
            return back()->with('error', 'Cannot delete an account that has transactions. Remove transactions first.');
        }

        $account->delete();

        return back()->with('success', 'Account deleted.');
    }
}
