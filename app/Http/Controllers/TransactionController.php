<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Loan;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = auth()->id();

        $month     = (int) $request->get('month', now()->month);
        $year      = (int) $request->get('year',  now()->year);
        $accountId = $request->filled('account_id') ? (int) $request->account_id : null;

        $monthStart = Carbon::createFromDate($year, $month, 1)->startOfMonth();

        // ── Opening balance ───────────────────────────────────────────────────
        // For a specific account: opening_balance + all prior transactions on that account.
        // For all accounts combined: sum of all account opening_balances + all prior transactions
        // EXCLUDING transfer debit legs (to avoid double-counting money moved between accounts).

        if ($accountId) {
            $account = Account::withoutGlobalScopes()
                ->where('created_by', $userId)
                ->findOrFail($accountId);

            $priorNet = Transaction::withoutGlobalScopes()
                ->where('created_by', $userId)
                ->where('account_id', $accountId)
                ->where('date', '<', $monthStart->toDateString())
                ->whereNull('deleted_at')
                ->selectRaw("SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END) as net")
                ->value('net') ?? 0;

            $openingBalance = round((float) $account->opening_balance + (float) $priorNet, 2);
        } else {
            // All accounts — exclude one leg of each transfer pair to avoid double-counting.
            // We keep the debit leg and discard the credit leg of transfers.
            // Simpler: exclude all transfer transactions from the balance calc since they're
            // internal movements and net to zero across all accounts.
            $priorNet = Transaction::withoutGlobalScopes()
                ->where('created_by', $userId)
                ->where('date', '<', $monthStart->toDateString())
                ->where('type', '!=', 'transfer')
                ->whereNull('deleted_at')
                ->selectRaw("SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END) as net")
                ->value('net') ?? 0;

            $accountsOpeningTotal = Account::withoutGlobalScopes()
                ->where('created_by', $userId)
                ->sum('opening_balance');

            $openingBalance = round((float) $accountsOpeningTotal + (float) $priorNet, 2);
        }

        // ── This month's transactions ─────────────────────────────────────────
        $query = Transaction::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->whereNull('deleted_at')
            ->with(['account:id,name,currency', 'category:id,name', 'budget:id,title',
                    'transferPair.account:id,name'])
            ->when($accountId, fn ($q) => $q->where('account_id', $accountId))
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->type))
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->category_id))
            ->orderBy('date')
            ->orderBy('id');

        $transactions = $query->get()->map(fn (Transaction $t) => [
            'id'                  => $t->id,
            'account_id'          => $t->account_id,
            'account_name'        => $t->account?->name,
            'type'                => $t->type,
            'direction'           => $t->direction,
            'amount'              => (float) $t->amount,
            'date'                => $t->date->toDateString(),
            'description'         => $t->description,
            'category_id'         => $t->category_id,
            'category_name'       => $t->category?->name,
            'budget_id'           => $t->budget_id,
            'budget_title'        => $t->budget?->title,
            'reference_type'      => $t->reference_type,
            'reference_id'        => $t->reference_id,
            'transfer_pair_id'    => $t->transfer_pair_id,
            'transfer_to_account' => $t->transferPair?->account?->name,
        ]);

        // ── Closing balance ───────────────────────────────────────────────────
        // For balance, transfers net to zero across all accounts so exclude them
        // when viewing all accounts. Per-account view includes them normally.
        $balanceTxns = $accountId
            ? $transactions
            : $transactions->where('type', '!=', 'transfer');

        $monthNet       = $balanceTxns->sum(fn ($t) => $t['direction'] === 'credit' ? $t['amount'] : -$t['amount']);
        $closingBalance = round($openingBalance + $monthNet, 2);

        // ── Monthly summary (income/expense only, no internal transfers) ──────
        $summary = [
            'total_income'   => $transactions->whereIn('type', ['income', 'borrow', 'lend_repayment'])->sum('amount'),
            'total_expense'  => $transactions->whereIn('type', ['expense', 'lend', 'borrow_repayment', 'saving'])->sum('amount'),
            'total_transfer' => $transactions->where('type', 'transfer')->where('direction', 'debit')->sum('amount'),
        ];

        // ── Support data for forms ────────────────────────────────────────────
        $accounts   = Account::withoutGlobalScopes()->where('created_by', $userId)->where('status', true)->get(['id', 'name', 'type', 'currency']);
        $categories = Category::withoutGlobalScopes()->where('created_by', $userId)->where('status', 1)->get(['id', 'name', 'type']);
        $budgets    = Budget::withoutGlobalScopes()->where('created_by', $userId)->where('month', $month)->where('year', $year)->get(['id', 'title']);
        $openLoans  = Loan::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->whereIn('status', ['unpaid', 'partial'])
            ->get(['id', 'type', 'person_name', 'amount', 'status'])
            ->map(fn ($l) => [
                'id'          => $l->id,
                'type'        => $l->type,
                'person_name' => $l->person_name,
                'amount'      => (float) $l->amount,
            ]);

        // Always include loans that are currently linked to this month's transactions,
        // even if their status is already 'paid' (so edit forms can still show them).
        $linkedLoanIds = Transaction::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->where('reference_type', 'loan')
            ->whereNotNull('reference_id')
            ->where('month', $month)
            ->where('year', $year)
            ->whereNull('deleted_at')
            ->pluck('reference_id')
            ->unique()
            ->diff($openLoans->pluck('id'));   // only IDs not already in the list

        if ($linkedLoanIds->isNotEmpty()) {
            $extra = Loan::withoutGlobalScopes()
                ->where('created_by', $userId)
                ->whereIn('id', $linkedLoanIds)
                ->get(['id', 'type', 'person_name', 'amount', 'status'])
                ->map(fn ($l) => [
                    'id'          => $l->id,
                    'type'        => $l->type,
                    'person_name' => $l->person_name,
                    'amount'      => (float) $l->amount,
                ]);
            $openLoans = $openLoans->merge($extra)->values();
        }

        // Per-account balances (always up to date for the sidebar)
        $accountBalances = Account::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->where('status', true)
            ->with(['transactions' => fn ($q) => $q->whereNull('deleted_at')])
            ->get()
            ->map(fn ($a) => [
                'id'       => $a->id,
                'name'     => $a->name,
                'type'     => $a->type,
                'currency' => $a->currency,
                'balance'  => $a->balance,
                'color'    => $a->color,
            ]);

        return Inertia::render('Transactions/Index', [
            'transactions'    => $transactions,
            'openingBalance'  => $openingBalance,
            'closingBalance'  => $closingBalance,
            'summary'         => $summary,
            'accounts'        => $accounts,
            'accountBalances' => $accountBalances,
            'categories'      => $categories,
            'budgets'         => $budgets,
            'openLoans'       => $openLoans,
            'filterMonth'     => $month,
            'filterYear'      => $year,
            'filters'         => [
                'account_id'  => $accountId ?? '',
                'type'        => $request->type ?? '',
                'category_id' => $request->category_id ?? '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // ── Transfer: two-leg atomic transaction ──────────────────────────────
        if ($request->input('type') === 'transfer' && !$request->filled('id')) {
            return $this->storeTransfer($request);
        }

        // ── Edit existing ─────────────────────────────────────────────────────
        if ($request->filled('id')) {
            $validated = $request->validate([
                'id'             => 'required|numeric|exists:transactions,id',
                'account_id'     => 'required|numeric|exists:accounts,id',
                'type'           => 'required|in:income,expense,lend,borrow,lend_repayment,borrow_repayment,saving',
                'amount'         => 'required|numeric|min:0.01',
                'date'           => 'required|date',
                'description'    => 'nullable|string|max:500',
                'category_id'    => 'nullable|numeric|exists:categories,id',
                'budget_id'      => 'nullable|numeric|exists:budgets,id',
                'reference_type' => 'nullable|string|max:50',
                'reference_id'   => 'nullable|numeric',
            ]);

            $direction = Transaction::DIRECTION_MAP[$validated['type']] ?? 'debit';
            $date      = Carbon::parse($validated['date']);

            Transaction::find($validated['id'])->update([
                'account_id'     => $validated['account_id'],
                'type'           => $validated['type'],
                'direction'      => $direction,
                'amount'         => $validated['amount'],
                'date'           => $validated['date'],
                'month'          => $date->month,
                'year'           => $date->year,
                'description'    => $validated['description'] ?? null,
                'category_id'    => $validated['category_id'] ?? null,
                'budget_id'      => $validated['budget_id'] ?? null,
                'reference_type' => $validated['reference_type'] ?? null,
                'reference_id'   => $validated['reference_id'] ?? null,
            ]);

            $this->maybeSyncLoan($validated['reference_type'] ?? null, $validated['reference_id'] ?? null);

            return redirect()->route('transactions.index', [
                'month' => $date->month,
                'year'  => $date->year,
            ])->with('success', 'Transaction updated.');
        }

        // ── Create single or bulk (non-transfer) ──────────────────────────────
        $validated = $request->validate([
            'account_id'           => 'required|numeric|exists:accounts,id',
            'type'                 => 'required|in:income,expense,lend,borrow,lend_repayment,borrow_repayment,saving',
            'date'                 => 'required|date',
            'description'          => 'nullable|string|max:500',
            'category_id'          => 'nullable|numeric|exists:categories,id',
            'budget_id'            => 'nullable|numeric|exists:budgets,id',
            'reference_type'       => 'nullable|string|max:50',
            'reference_id'         => 'nullable|numeric',
            'amount'               => 'nullable|numeric|min:0.01',
            'items'                => 'nullable|array',
            'items.*.amount'       => 'nullable|numeric|min:0.01',
            'items.*.description'  => 'nullable|string|max:500',
            'items.*.category_id'  => 'nullable|numeric|exists:categories,id',
            'items.*.budget_id'    => 'nullable|numeric|exists:budgets,id',
        ]);

        $direction = Transaction::DIRECTION_MAP[$validated['type']] ?? 'debit';
        $date      = Carbon::parse($validated['date']);

        $base = [
            'account_id'     => $validated['account_id'],
            'type'           => $validated['type'],
            'direction'      => $direction,
            'date'           => $validated['date'],
            'month'          => $date->month,
            'year'           => $date->year,
            'budget_id'      => $validated['budget_id'] ?? null,
            'reference_type' => $validated['reference_type'] ?? null,
            'reference_id'   => $validated['reference_id'] ?? null,
        ];

        // Filter out blank item rows (amount empty/zero) sent from the frontend
        $items = collect($validated['items'] ?? [])
            ->filter(fn ($i) => isset($i['amount']) && (float) $i['amount'] > 0)
            ->values();

        // Must have either a top-level amount or at least one valid item
        if ($items->isEmpty() && empty($validated['amount'])) {
            return back()->withErrors(['amount' => 'Amount is required.'])->withInput();
        }

        DB::transaction(function () use ($validated, $base, $items) {
            if ($items->isNotEmpty()) {
                foreach ($items as $item) {
                    Transaction::create(array_merge($base, [
                        'amount'      => $item['amount'],
                        'description' => $item['description'] ?? $validated['description'] ?? null,
                        'category_id' => $item['category_id'] ?? $validated['category_id'] ?? null,
                        'budget_id'   => $item['budget_id']   ?? $validated['budget_id']   ?? null,
                    ]));
                }
            } else {
                Transaction::create(array_merge($base, [
                    'amount'      => $validated['amount'],
                    'description' => $validated['description'] ?? null,
                    'category_id' => $validated['category_id'] ?? null,
                ]));
            }

            $this->maybeSyncLoan($validated['reference_type'] ?? null, $validated['reference_id'] ?? null);
        });

        return redirect()->route('transactions.index', [
            'month' => $date->month,
            'year'  => $date->year,
        ])->with('success', 'Transaction saved.');
    }

    /**
     * Internal transfer between two accounts.
     * Creates two paired transaction rows atomically.
     */
    private function storeTransfer(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'account_id'    => 'required|numeric|exists:accounts,id|different:to_account_id',
            'to_account_id' => 'required|numeric|exists:accounts,id',
            'amount'        => 'required|numeric|min:0.01',
            'date'          => 'required|date',
            'description'   => 'nullable|string|max:500',
        ]);

        $date = Carbon::parse($validated['date']);

        DB::transaction(function () use ($validated, $date) {
            // Debit leg — money leaves source account
            $debit = Transaction::create([
                'account_id'  => $validated['account_id'],
                'type'        => 'transfer',
                'direction'   => 'debit',
                'amount'      => $validated['amount'],
                'date'        => $validated['date'],
                'month'       => $date->month,
                'year'        => $date->year,
                'description' => $validated['description'] ?? null,
            ]);

            // Credit leg — money arrives at destination account
            $credit = Transaction::create([
                'account_id'       => $validated['to_account_id'],
                'type'             => 'transfer',
                'direction'        => 'credit',
                'amount'           => $validated['amount'],
                'date'             => $validated['date'],
                'month'            => $date->month,
                'year'             => $date->year,
                'description'      => $validated['description'] ?? null,
                'transfer_pair_id' => $debit->id,
            ]);

            // Link both legs to each other
            $debit->update(['transfer_pair_id' => $credit->id]);
        });

        return redirect()->route('transactions.index', [
            'month' => $date->month,
            'year'  => $date->year,
        ])->with('success', 'Transfer recorded.');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        $month   = $transaction->month;
        $year    = $transaction->year;
        $refType = $transaction->reference_type;
        $refId   = $transaction->reference_id;

        DB::transaction(function () use ($transaction) {
            // If this is a transfer leg, delete the paired leg too
            if ($transaction->type === 'transfer' && $transaction->transfer_pair_id) {
                Transaction::withoutGlobalScopes()
                    ->find($transaction->transfer_pair_id)
                    ?->delete();
            }
            $transaction->delete();
        });

        $this->maybeSyncLoan($refType, $refId);

        return redirect()->route('transactions.index', compact('month', 'year'))
            ->with('success', 'Transaction deleted.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function maybeSyncLoan(?string $refType, $refId): void
    {
        if ($refType === 'loan' && $refId) {
            $loan = Loan::withoutGlobalScopes()->with('repaymentTransactions')->find($refId);
            $loan?->syncStatus();
        }
    }
}
