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
    public function index(): Response
    {
        return Inertia::render('Budget/Index', [
            'budgets' => Budget::latest()->get(),
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
            'title'    => 'required|string',
            'description'   => 'required|string',
            'amount'    => 'required|numeric',
            'status'    => 'required|numeric',
            'type'      => 'required|numeric', 
            'priority' => 'required|numeric',
            'month' => 'required|numeric',
            'year' => 'required|numeric',
        ]);
        // return $request;
        Budget::create($validated);
        return redirect()->route('budget.index');
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
        //
    }
}
