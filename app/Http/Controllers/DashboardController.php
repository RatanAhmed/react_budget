<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Loan;
use App\Models\Resume\Resume;
use App\Models\Task;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = auth()->id();
        $month  = (int) ($request->input('month', now()->month));
        $year   = (int) ($request->input('year',  now()->year));

        $monthStart = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $monthEnd   = $monthStart->copy()->endOfMonth();

        // ── Opening balance (sum of all credits/debits before this month) ─────
        $txnOpeningNet = Transaction::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->where('date', '<', $monthStart->toDateString())
            ->selectRaw("SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END) as net")
            ->value('net') ?? 0;

        $accountsOpeningTotal = Account::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->sum('opening_balance');

        $openingBalance = round((float) $accountsOpeningTotal + (float) $txnOpeningNet, 2);

        // ── This month's transactions ─────────────────────────────────────────
        $monthTxns = Transaction::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->get(['type', 'direction', 'amount']);

        $totalIncome  = $monthTxns->where('direction', 'credit')->whereIn('type', ['income', 'borrow', 'lend_repayment'])->sum('amount');
        $totalExpense = $monthTxns->where('direction', 'debit')->whereIn('type', ['expense', 'lend', 'borrow_repayment', 'saving'])->sum('amount');
        $monthNet     = $monthTxns->sum(fn ($t) => $t->direction === 'credit' ? (float) $t->amount : -(float) $t->amount);
        $closingBalance = round($openingBalance + $monthNet, 2);

        // ── Budget planned vs spent ───────────────────────────────────────────
        $budgetTotal = Budget::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->sum('amount');

        // ── Tasks ─────────────────────────────────────────────────────────────
        $taskQuery = Task::where('created_by', $userId)
            ->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()]);
        $tasks = [
            'count'     => (clone $taskQuery)->count(),
            'pending'   => (clone $taskQuery)->where('status', 0)->count(),
            'completed' => (clone $taskQuery)->where('status', 1)->count(),
            'progress'  => (clone $taskQuery)->where('status', 2)->count(),
            'cancelled' => (clone $taskQuery)->where('status', 3)->count(),
        ];

        // ── Resumes ───────────────────────────────────────────────────────────
        $resumes = ['count' => Resume::where('created_by', $userId)->count()];

        // ── Loans outstanding ─────────────────────────────────────────────────
        $allLoans = Loan::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->whereIn('status', ['unpaid', 'partial'])
            ->with('repaymentTransactions')
            ->get();

        $lendLoans   = $allLoans->where('type', 'lend');
        $borrowLoans = $allLoans->where('type', 'borrow');

        $loans = [
            'lend_count'         => $lendLoans->count(),
            'lend_outstanding'   => round($lendLoans->sum(fn ($l) => $l->outstanding), 2),
            'borrow_count'       => $borrowLoans->count(),
            'borrow_outstanding' => round($borrowLoans->sum(fn ($l) => $l->outstanding), 2),
        ];

        // ── Accounts ──────────────────────────────────────────────────────────
        $accounts = Account::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->where('status', true)
            ->with('transactions')
            ->get()
            ->map(fn ($a) => [
                'id'      => $a->id,
                'name'    => $a->name,
                'type'    => $a->type,
                'balance' => $a->balance,
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'opening_balance' => $openingBalance,
                'closing_balance' => $closingBalance,
                'total_income'    => round((float) $totalIncome, 2),
                'total_expense'   => round((float) $totalExpense, 2),
                'budget_planned'  => round((float) $budgetTotal, 2),
                'tasks'           => $tasks,
                'resumes'         => $resumes,
            ],
            'loans'    => $loans,
            'accounts' => $accounts,
            'filters'  => compact('month', 'year'),
        ]);
    }
}
