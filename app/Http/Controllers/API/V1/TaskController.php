<?php

namespace App\Http\Controllers\API\V1;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\TaskRequest;
use App\Http\Resources\TaskResource;

class TaskController extends Controller
{
    public function index(Request $request)
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
        $tasks = $tasksQuery
            ->orderBy('status')
            ->orderBy('date')
            ->orderBy('time')->get();

        return response()->json([
            'tasks' => TaskResource::collection($tasks),
        ]);
    }

    public function store(TaskRequest $request)
    {
        $validated = $request->validated();
        if($request->id){
            Task::find($request->id)->update($validated);
        }else{
            Task::create($validated);
        }
        return response()->json(['message' => 'Task Created']);
    }
}
