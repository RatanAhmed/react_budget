<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()//:Response
    {
        return Inertia::render('Expense/Index', [
            'expenses' => Expense::with(['income:id,source,details', 'budget:id,description', 'category:id,name'])
                        ->latest()->get(),
            'incomes' => Income::where('status', 1)->latest()->get(),
            'budgets' => Budget::where('status', 1)->latest()->get(),
            'categories' => Category::where('status', 1)->latest()->get(),
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
        $validated = $request->validate([
            'date'    => 'required|string',
            'details'   => 'required|string',
            'amount'    => 'required|numeric',
            'budget_id'    => 'required|numeric',
            'income_id'      => 'required|numeric', 
            'category_id'      => 'nullable|numeric|exists:categories,id', 
        ]);
        // return $request;
        Expense::create($validated);
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
