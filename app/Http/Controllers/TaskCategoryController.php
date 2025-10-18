<?php

namespace App\Http\Controllers;

use App\Models\TaskCategory;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class TaskCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)//:Response
    {
        $tasksQuery = TaskCategory::query();
        
        $tasksQuery->when($request->filled('date'), function ($query) use ($request) {
            $query->where('date', $request->date);
        });
        
        $tasksQuery->where('created_by', auth()->id());
        $tasks = $tasksQuery->orderBy('date')->orderBy('time')->get();

        return Inertia::render('Task/Index', [
            'tasks' => $tasks,
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
            'name'    => 'required|string|max:191',
            'status'    => 'nullable|numeric',
        ]);
        // return $request;
        if($request->id){
            TaskCategory::find($request->id)->update($validated);
        }else{
            TaskCategory::create($validated);
        }
        return redirect()->route('tasks.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskCategory $task)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TaskCategory $task)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TaskCategory $task)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskCategory $task)
    {
        //
    }
    public function updateStatus(Request $request, TaskCategory $task)
    {
        $task->update(['status'=> $request->status]);
         return redirect()->back()->with('success', 'Updated');
    }
}
