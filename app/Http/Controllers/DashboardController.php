<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Loan;
use App\Models\Resume\Resume;
use App\Models\Saving;
use App\Models\Task;
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

        $dateFrom = Carbon::createFromDate($year, $month, 1)->startOfMonth()->toDateString();
        $dateTo   = Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

        // ── Expenses ──────────────────────────────────────────────────────────
        $expenseQuery = Expense::where('created_by', $userId)->whereBetween('date', [$dateFrom, $dateTo]);
        $expenses = [
            'count' => (clone $expenseQuery)->count(),
            'total' => (clone $expenseQuery)->sum('amount'),
        ];

        // ── Income ────────────────────────────────────────────────────────────
        $incomeQuery = Income::where('created_by', $userId)->where('month', $month)->where('year', $year);
        $incomes = [
            'count' => (clone $incomeQuery)->count(),
            'total' => (clone $incomeQuery)->sum('amount'),
        ];

        // ── Budget ────────────────────────────────────────────────────────────
        $budgetQuery = Budget::where('created_by', $userId)->where('month', $month)->where('year', $year);
        $budgets = [
            'count' => (clone $budgetQuery)->count(),
            'total' => (clone $budgetQuery)->sum('amount'),
        ];

        // ── Tasks ─────────────────────────────────────────────────────────────
        $taskQuery = Task::where('created_by', $userId)->whereBetween('date', [$dateFrom, $dateTo]);
        $tasks = [
            'count'     => (clone $taskQuery)->count(),
            'pending'   => (clone $taskQuery)->where('status', 0)->count(),
            'completed' => (clone $taskQuery)->where('status', 1)->count(),
            'progress'  => (clone $taskQuery)->where('status', 2)->count(),
            'cancelled' => (clone $taskQuery)->where('status', 3)->count(),
        ];

        // ── Savings ───────────────────────────────────────────────────────────
        $savingQuery = Saving::where('created_by', $userId)->whereBetween('date', [$dateFrom, $dateTo]);
        $savings = [
            'count' => (clone $savingQuery)->count(),
            'total' => (clone $savingQuery)->sum('amount'),
        ];

        // ── Resumes ───────────────────────────────────────────────────────────
        $resumes = [
            'count' => Resume::where('created_by', $userId)->count(),
        ];

        // ── Loans ─────────────────────────────────────────────────────────────
        $allLoans = Loan::withoutGlobalScopes()
            ->where('created_by', $userId)
            ->whereIn('status', ['unpaid', 'partial'])
            ->with('repayments')
            ->get();

        $lendLoans   = $allLoans->where('type', 'lend');
        $borrowLoans = $allLoans->where('type', 'borrow');

        $loans = [
            'lend_count'         => $lendLoans->count(),
            'lend_outstanding'   => round($lendLoans->sum(fn ($l) => $l->outstanding), 2),
            'borrow_count'       => $borrowLoans->count(),
            'borrow_outstanding' => round($borrowLoans->sum(fn ($l) => $l->outstanding), 2),
        ];

        // ── Carry-forward alert ───────────────────────────────────────────────
        $prevDate    = Carbon::createFromDate($year, $month, 1)->subMonth();
        $prevMonth   = $prevDate->month;
        $prevYear    = $prevDate->year;
        $prevIncome  = Income::where('created_by', $userId)->where('month', $prevMonth)->where('year', $prevYear)->sum('amount');
        $prevDateFrom = $prevDate->copy()->startOfMonth()->toDateString();
        $prevDateTo   = $prevDate->copy()->endOfMonth()->toDateString();
        $prevExpenses = Expense::where('created_by', $userId)->whereBetween('date', [$prevDateFrom, $prevDateTo])->sum('amount');
        $prevNet      = round($prevIncome - $prevExpenses, 2);
        $carryExists  = Income::where('created_by', $userId)->where('month', $month)->where('year', $year)->where('type', 3)->exists();

        $carryForward = [
            'prev_month'    => $prevMonth,
            'prev_year'     => $prevYear,
            'prev_net'      => $prevNet,
            'already_added' => $carryExists,
        ];

        return Inertia::render('Dashboard', [
            'stats' => compact('expenses', 'incomes', 'budgets', 'tasks', 'savings', 'resumes'),
            'loans'        => $loans,
            'carryForward' => $carryForward,
            'filters' => [
                'month' => $month,
                'year'  => $year,
            ],
        ]);
    }
}
