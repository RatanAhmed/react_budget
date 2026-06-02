<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)//:Response
    {
        $authId = auth()->id();
        $query = Expense::query();

        // ── Date range filter (date_from / date_to) ───────────────────────────
        // Default to current month when neither is supplied
        $dateFrom = $request->filled('date_from')
            ? $request->date_from
            : now()->startOfMonth()->toDateString();

        $dateTo = $request->filled('date_to')
            ? $request->date_to
            : now()->endOfMonth()->toDateString();

        $query->whereBetween('date', [$dateFrom, $dateTo]);

        $query->when($request->filled('budget_id'), function ($query) use ($request) {
            $query->where('budget_id', $request->budget_id);
        });
        $query->when($request->filled('income_id'), function ($query) use ($request) {
            $query->where('income_id', $request->income_id);
        });
        $query->when($request->filled('category_id'), function ($query) use ($request) {
            $query->where('category_id', $request->category_id);
        });

        $query->with(['income:id,source,details', 'budget:id,title,description', 'category:id,name']);
        $query->where('created_by', $authId);
        $expenses = $query->orderByDesc('date')->paginate(15)->withQueryString();

        return Inertia::render('Expense/Index', [
            'expenses'   => $expenses,
            'incomes'    => Income::where('status', 1)->latest()->get(),
            'budgets'    => Budget::where('status', 1)->latest()->get(),
            'categories' => Category::where('status', 1)->where('type', 0)->latest()->get(),
            'filters'    => [
                'date_from'   => $dateFrom,
                'date_to'     => $dateTo,
                'income_id'   => $request->income_id ?? '',
                'budget_id'   => $request->budget_id ?? '',
                'category_id' => $request->category_id ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     * Handles two shapes:
     *   - Edit (single):  { id, date, details, amount, budget_id, income_id, category_id }
     *   - Bulk create:    { date, income_id, budget_id, items: [{ details, amount, category_id }] }
     */
    public function store(Request $request)
    {
        // ── Edit existing record ──────────────────────────────────────────────
        if ($request->filled('id')) {
            $validated = $request->validate([
                'id'                        => 'required|numeric|exists:expenses,id',
                'date'                      => 'required|date',
                'details'                   => 'required|string|max:500',
                'amount'                    => 'required|numeric|min:0',
                'budget_id'                 => 'nullable|numeric|exists:budgets,id',
                'income_id'                 => 'nullable|numeric|exists:incomes,id',
                'category_id'               => 'nullable|numeric|exists:categories,id',
                'extra_items'               => 'nullable|array',
                'extra_items.*.details'     => 'required_with:extra_items|string|max:500',
                'extra_items.*.amount'      => 'required_with:extra_items|numeric|min:0',
                'extra_items.*.category_id' => 'nullable|numeric|exists:categories,id',
            ]);

            Expense::find($validated['id'])->update([
                'date'        => $validated['date'],
                'details'     => $validated['details'],
                'amount'      => $validated['amount'],
                'budget_id'   => $validated['budget_id'] ?? null,
                'income_id'   => $validated['income_id'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
            ]);

            // Create any extra rows added during edit
            foreach ($validated['extra_items'] ?? [] as $item) {
                Expense::create([
                    'date'        => $validated['date'],
                    'income_id'   => $validated['income_id'] ?? null,
                    'budget_id'   => $validated['budget_id'] ?? null,
                    'details'     => $item['details'],
                    'amount'      => $item['amount'],
                    'category_id' => $item['category_id'] ?? null,
                ]);
            }

            return redirect()->route('expense.index');
        }

        // ── Bulk create (multiple line items) ─────────────────────────────────
        $validated = $request->validate([
            'date'                  => 'required|date',
            'income_id'             => 'nullable|numeric|exists:incomes,id',
            'budget_id'             => 'nullable|numeric|exists:budgets,id',
            'items'                 => 'required|array|min:1',
            'items.*.details'       => 'required|string|max:500',
            'items.*.amount'        => 'required|numeric|min:0',
            'items.*.category_id'   => 'nullable|numeric|exists:categories,id',
        ]);

        $rows = collect($validated['items'])->map(fn($item) => [
            'date'        => $validated['date'],
            'income_id'   => $validated['income_id'],
            'budget_id'   => $validated['budget_id'] ?? null,
            'details'     => $item['details'],
            'amount'      => $item['amount'],
            'category_id' => $item['category_id'] ?? null,
        ]);

        foreach ($rows as $row) {
            Expense::create($row);
        }

        return redirect()->route('expense.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Expense $expense)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Expense $expense)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Expense $expense)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense)
    {
        //
    }
}
