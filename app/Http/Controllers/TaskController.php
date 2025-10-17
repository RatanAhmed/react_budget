<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)//:Response
    {
        $tasksQuery = Task::query();
        
        $tasksQuery->when($request->filled('date'), function ($query) use ($request) {
            $query->where('date', $request->date);
        });
        $tasksQuery->when($request->filled('status'), function ($query) use ($request) {
            $query->where('status', $request->status);
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
            'date'    => 'required|date',
            'time' => 'required',
            'details'   => 'required|string|max:255',
            'priority'    => 'required|numeric',
            'remarks'    => 'nullable|string',
            'status'    => 'nullable|numeric',
        ]);
        // return $request;
        if($request->id){
            Task::find($request->id)->update($validated);
        }else{
            Task::create($validated);
        }
        return redirect()->route('tasks.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        //
    }
    public function updateStatus(Request $request, Task $task)
    {
        $task->update(['status'=> $request->status]);
         return redirect()->back()->with('success', 'Updated');
    }
}
