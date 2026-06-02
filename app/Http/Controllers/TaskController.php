<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Models\Task;
use App\Models\TaskCategory;
use App\Models\TaskSchedule;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // ── Index — monthly load ──────────────────────────────────────────────────

    public function index(Request $request)
    {
        $authId = auth()->id();

        // Default to the most recent month that has data, falling back to current month
        if (!$request->filled('date_from') && !$request->filled('date_to')) {
            $latestTask = Task::query()
                ->where('created_by', $authId)
                ->orderByDesc('date')
                ->value('date');

            $anchor = $latestTask
                ? \Carbon\Carbon::parse($latestTask)
                : now();

            $dateFrom = $anchor->copy()->startOfMonth()->toDateString();
            $dateTo   = $anchor->copy()->endOfMonth()->toDateString();
        } else {
            $dateFrom = $request->date_from;
            $dateTo   = $request->date_to;
        }

        $tasks = Task::query()
            ->with(['category:id,name', 'schedule'])
            ->where('created_by', $authId)
            // Use whereDate to handle both date and timestamp column types correctly
            ->whereDate('date', '>=', $dateFrom)
            ->whereDate('date', '<=', $dateTo)
            ->when($request->filled('task_categories_id'), fn ($q) =>
                $q->where('task_categories_id', $request->task_categories_id))
            ->when($request->input('status', '') !== '', fn ($q) =>
                $q->where('status', $request->input('status')))
            ->when($request->filled('is_recurring'), fn ($q) =>
                $q->where('is_recurring', (bool) $request->is_recurring))
            ->orderBy('date')
            ->orderBy('time')
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($t) => [
                'id'                 => $t->id,
                'date'               => \Carbon\Carbon::parse($t->date)->format('Y-m-d'),
                'time'               => $t->time,
                'details'            => $t->details,
                'priority'           => (int) $t->priority,
                'status'             => (int) $t->status,
                'status_name'        => $t->status_name,
                'remarks'            => $t->remarks,
                'task_categories_id' => $t->task_categories_id,
                'is_recurring'       => (bool) $t->is_recurring,
                'end_date'           => $t->end_date ? \Carbon\Carbon::parse($t->end_date)->format('Y-m-d') : null,
                'frequency_label'    => $t->frequency_label,
                'category'           => $t->category,
                'schedule'           => $t->schedule ? [
                    'interval_type'  => $t->schedule->interval_type,
                    'interval_value' => $t->schedule->interval_value,
                    'week_days'      => $t->schedule->week_days,
                    'month_day'      => $t->schedule->month_day,
                    'month'          => $t->schedule->month,
                ] : null,
            ]);

        return Inertia::render('Task/Index', [
            'tasks'      => $tasks,
            'categories' => TaskCategory::where('created_by', $authId)->where('status', 1)->get(),
            'filters'    => [
                'date_from'          => $dateFrom,
                'date_to'            => $dateTo,
                'status'             => $request->input('status', ''),
                'task_categories_id' => $request->input('task_categories_id', ''),
                'is_recurring'       => $request->input('is_recurring', ''),
            ],
        ]);
    }

    public function store(TaskRequest $request)
    {
        $validated    = $request->validated();
        $scheduleData = $validated['schedule'] ?? null;
        unset($validated['schedule']);

        if ($request->filled('id')) {
            // ── Update ────────────────────────────────────────────────────────
            $task = Task::findOrFail($request->id);
            $task->update($validated);

            if ($task->is_recurring && $scheduleData) {
                TaskSchedule::updateOrCreate(
                    ['task_id' => $task->id],
                    array_merge($scheduleData, ['task_id' => $task->id])
                );
            } elseif (!$task->is_recurring) {
                $task->schedule()->delete();
            }
        } else {
            // ── Bulk create — items array ─────────────────────────────────────
            $items = $validated['items'] ?? null;
            unset($validated['items']);

            if ($items) {
                foreach ($items as $item) {
                    $itemSchedule = $item['schedule'] ?? null;
                    unset($item['schedule']);

                    $task = Task::create(array_merge($validated, $item));

                    if (($item['is_recurring'] ?? false) && $itemSchedule) {
                        TaskSchedule::create(array_merge($itemSchedule, ['task_id' => $task->id]));
                    }
                }
            } else {
                $task = Task::create($validated);
                if ($task->is_recurring && $scheduleData) {
                    TaskSchedule::create(array_merge($scheduleData, ['task_id' => $task->id]));
                }
            }
        }

        return redirect()->route('tasks.index');
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->back()->with('success', 'Task deleted.');
    }

    // ── Quick status toggle ───────────────────────────────────────────────────

    public function updateStatus(Request $request, Task $task)
    {
        $request->validate(['status' => 'required|integer|in:0,1,2,3']);
        $task->update(['status' => $request->status]);
        return redirect()->back()->with('success', 'Updated');
    }
}
