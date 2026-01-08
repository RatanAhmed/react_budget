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
    public function index(Request $request)//:Response
    {
        $authId = auth()->id();
        $query = Expense::query();
        
        $query->when($request->filled('date'), function ($query) use ($request) {
            $query->where('date', $request->date);
        });

        $query->when($request->filled('budget_id'), function ($query) use ($request) {
            $query->where('budget_id', $request->budget_id);
        });
        $query->when($request->filled('income_id'), function ($query) use ($request) {
            $query->where('income_id', $request->income_id);
        });
        
        $query->with(['income:id,source,details', 'budget:id,title,description', 'category:id,name']);
        $query->where('created_by', $authId);
        $expenses = $query->orderByDesc('date')->get();
        // Expense::with(['income:id,source,details', 'budget:id,title,description', 'category:id,name'])
        //                 ->orderBy('date','desc')->get();
        return Inertia::render('Expense/Index', [
            'expenses' => $expenses,
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
            'id'    => 'nullable|numeric',
            'date'    => 'required|string',
            'details'   => 'required|string',
            'amount'    => 'required|numeric',
            'budget_id'    => 'required|numeric',
            'income_id'      => 'required|numeric', 
            'category_id'      => 'nullable|numeric|exists:categories,id', 
        ]);

        if($request->id){
            Expense::find($request->id)->update($validated);
        }else{
            Expense::create($validated);
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
