<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Loan;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function index(Request $request): Response
    {
        $month = (int) $request->get('month', now()->month);
        $year  = (int) $request->get('year',  now()->year);

        $earnings = Income::where('month', $month)
            ->where('year', $year)
            ->latest()
            ->get();

        // ── Previous month net (for carry-forward suggestion) ─────────────────
        $prevDate    = Carbon::createFromDate($year, $month, 1)->subMonth();
        $prevMonth   = $prevDate->month;
        $prevYear    = $prevDate->year;

        $prevIncome  = Income::where('month', $prevMonth)->where('year', $prevYear)->sum('amount');

        $prevDateFrom = $prevDate->startOfMonth()->toDateString();
        $prevDateTo   = $prevDate->copy()->endOfMonth()->toDateString();
        $prevExpenses = Expense::where('created_by', auth()->id())
            ->whereBetween('date', [$prevDateFrom, $prevDateTo])
            ->sum('amount');

        $prevNet = $prevIncome - $prevExpenses;

        // Does a carry-forward entry already exist for this month?
        $carryExists = Income::where('month', $month)
            ->where('year', $year)
            ->where('type', 3)
            ->exists();

        // ── Outstanding loan totals ───────────────────────────────────────────
        $lendOutstanding   = Loan::where('type', 'lend')
            ->whereIn('status', ['unpaid', 'partial'])
            ->get()
            ->sum(fn ($l) => $l->outstanding);

        $borrowOutstanding = Loan::where('type', 'borrow')
            ->whereIn('status', ['unpaid', 'partial'])
            ->get()
            ->sum(fn ($l) => $l->outstanding);

        return Inertia::render('Income/Index', [
            'earnings'          => $earnings,
            'filterMonth'       => $month,
            'filterYear'        => $year,
            'carryForward'      => [
                'prev_month'    => $prevMonth,
                'prev_year'     => $prevYear,
                'prev_net'      => round($prevNet, 2),
                'already_added' => $carryExists,
            ],
            'loanSummary'       => [
                'lend_outstanding'   => round($lendOutstanding, 2),
                'borrow_outstanding' => round($borrowOutstanding, 2),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // ── Edit existing ─────────────────────────────────────────────────────
        if ($request->filled('id')) {
            $validated = $request->validate([
                'id'      => 'required|numeric|exists:incomes,id',
                'source'  => 'required|string',
                'details' => 'required|string',
                'amount'  => 'required|numeric',
                'status'  => 'required|numeric',
                'type'    => 'required|numeric',
                'month'   => 'nullable|numeric|min:1|max:12',
                'year'    => 'nullable|numeric|min:2020|max:2035',
            ]);
            Income::find($validated['id'])->update([
                'source'  => $validated['source'],
                'details' => $validated['details'],
                'amount'  => $validated['amount'],
                'status'  => $validated['status'],
                'type'    => $validated['type'],
                'month'   => $validated['month'] ?? null,
                'year'    => $validated['year']  ?? null,
            ]);
            return redirect()->route('income.index', [
                'month' => $validated['month'] ?? now()->month,
                'year'  => $validated['year']  ?? now()->year,
            ]);
        }

        // ── Create ────────────────────────────────────────────────────────────
        $validated = $request->validate([
            'source'  => 'required|string',
            'details' => 'required|string',
            'amount'  => 'required|numeric',
            'status'  => 'required|numeric',
            'type'    => 'required|numeric',
            'month'   => 'required|numeric|min:1|max:12',
            'year'    => 'required|numeric|min:2020|max:2035',
        ]);
        Income::create($validated);
        return redirect()->route('income.index', [
            'month' => $validated['month'],
            'year'  => $validated['year'],
        ]);
    }

    /**
     * Carry forward last month's net balance as an income entry for this month.
     */
    public function carryForward(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month'  => 'required|integer|min:1|max:12',
            'year'   => 'required|integer|min:2020|max:2035',
            'amount' => 'required|numeric|min:0.01',
        ]);

        // Prevent duplicate carry-forward for same month
        $exists = Income::where('month', $validated['month'])
            ->where('year', $validated['year'])
            ->where('type', 3)
            ->exists();

        if ($exists) {
            return redirect()->route('income.index', [
                'month' => $validated['month'],
                'year'  => $validated['year'],
            ])->with('error', 'A carry-forward entry already exists for this month.');
        }

        $prevDate = Carbon::createFromDate($validated['year'], $validated['month'], 1)->subMonth();

        Income::create([
            'source'  => 'Carry Forward',
            'details' => "Balance carried forward from {$prevDate->format('F Y')}",
            'amount'  => $validated['amount'],
            'status'  => 1,
            'type'    => 3, // carry_forward
            'month'   => $validated['month'],
            'year'    => $validated['year'],
        ]);

        return redirect()->route('income.index', [
            'month' => $validated['month'],
            'year'  => $validated['year'],
        ])->with('success', 'Balance carried forward successfully.');
    }

    public function destroy(Income $income): RedirectResponse
    {
        $month = $income->month;
        $year  = $income->year;
        $income->delete();
        return redirect()->route('income.index', compact('month', 'year'));
    }
}
