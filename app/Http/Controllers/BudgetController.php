<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $month = (int) $request->get('month', now()->month);
        $year  = (int) $request->get('year',  now()->year);

        $budgets = Budget::where('month', $month)
            ->where('year', $year)
            ->latest()
            ->get();

        return Inertia::render('Budget/Index', [
            'budgets'      => $budgets,
            'filterMonth'  => $month,
            'filterYear'   => $year,
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
     */
    public function store(Request $request)
    {
        // ── Edit existing ─────────────────────────────────────────────────────
        if ($request->filled('id')) {
            $validated = $request->validate([
                'id'          => 'required|numeric|exists:budgets,id',
                'title'       => 'required|string',
                'description' => 'required|string',
                'amount'      => 'required|numeric',
                'status'      => 'required|numeric',
                'type'        => 'required|numeric',
                'priority'    => 'required|numeric',
                'month'       => 'required|numeric',
                'year'        => 'required|numeric',
            ]);
            Budget::find($validated['id'])->update([
                'title'       => $validated['title'],
                'description' => $validated['description'],
                'amount'      => $validated['amount'],
                'status'      => $validated['status'],
                'type'        => $validated['type'],
                'priority'    => $validated['priority'],
                'month'       => $validated['month'],
                'year'        => $validated['year'],
            ]);
            return redirect()->route('budget.index', [
                'month' => $validated['month'],
                'year'  => $validated['year'],
            ]);
        }

        // ── Create ────────────────────────────────────────────────────────────
        $validated = $request->validate([
            'title'       => 'required|string',
            'description' => 'required|string',
            'amount'      => 'required|numeric',
            'status'      => 'required|numeric',
            'type'        => 'required|numeric',
            'priority'    => 'required|numeric',
            'month'       => 'required|numeric',
            'year'        => 'required|numeric',
        ]);
        Budget::create($validated);
        return redirect()->route('budget.index', [
            'month' => $validated['month'],
            'year'  => $validated['year'],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Budget $budget)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Budget $budget)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Budget $budget)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Budget $budget)
    {
        $month = $budget->month;
        $year  = $budget->year;
        $budget->delete();
        return redirect()->route('budget.index', compact('month', 'year'));
    }
}
