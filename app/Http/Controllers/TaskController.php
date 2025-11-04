<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\Task;
use App\Models\TaskCategory;
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
        $authId = auth()->id();
        $tasksQuery = Task::query();
        
        $tasksQuery->when($request->filled('date'), function ($query) use ($request) {
            $query->where('date', $request->date);
        });

        $tasksQuery->when($request->filled('task_categories_id'), function ($query) use ($request) {
            $query->where('task_categories_id', $request->task_categories_id);
        });

        $tasksQuery->when( $request->filled('status'), function ($query) use ($request) {
            $query->where('status', $request->status);
        });
        
        $tasksQuery->with(['category:id,name']);
        $tasksQuery->where('created_by', $authId);
        $tasks = $tasksQuery->orderBy('date')->orderBy('time')->get();

        return Inertia::render('Task/Index', [
            'tasks' => $tasks,
            'categories' => TaskCategory::where('created_by', $authId)->where('status',1)->get(),
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
    public function store(TaskRequest $request)
    {
        
        // $validated = $request->validate([
        //     'date'    => 'required|date',
        //     'time' => 'required',
        //     'details'   => 'required|string|max:255',
        //     'priority'    => 'required|numeric',
        //     'remarks'    => 'nullable|string',
        //     'status'    => 'nullable|numeric',
        //     'task_categories_id' => 'nullable|numeric',
        // ]);
        // return $request;
        $validated = $request->validated();
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
