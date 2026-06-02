<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\TaskSchedule;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateRecurringTasks extends Command
{
    protected $signature   = 'tasks:generate-recurring
                                {--days=7 : How many days ahead to generate tasks for}
                                {--dry-run : Preview without saving}';

    protected $description = 'Auto-create task instances for recurring tasks based on their schedule.';

    public function handle(): int
    {
        $lookahead = (int) $this->option('days');
        $dryRun    = $this->option('dry-run');
        $from      = Carbon::today();
        $to        = Carbon::today()->addDays($lookahead);

        $this->info("Generating recurring tasks from {$from->toDateString()} to {$to->toDateString()}...");

        $schedules = TaskSchedule::with('task')->get();
        $created   = 0;
        $skipped   = 0;

        foreach ($schedules as $schedule) {
            $task = $schedule->task;

            if (!$task || !$task->is_recurring) {
                continue;
            }

            // Respect end_date
            $window_to = $task->end_date
                ? Carbon::parse($task->end_date)->min($to)
                : $to;

            if ($window_to->lt($from)) {
                continue;
            }

            $occurrences = $schedule->occurrencesBetween($from, $window_to);

            foreach ($occurrences as $date) {
                // Skip if a task already exists for this date + details + user
                $exists = Task::withoutGlobalScopes()
                    ->where('created_by', $task->created_by)
                    ->where('details', $task->details)
                    ->where('date', $date->toDateString())
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                if (!$dryRun) {
                    Task::withoutGlobalScopes()->create([
                        'date'               => $date->toDateString(),
                        'time'               => $task->time,
                        'details'            => $task->details,
                        'priority'           => $task->priority,
                        'status'             => 0,
                        'remarks'            => null,
                        'task_categories_id' => $task->task_categories_id,
                        'is_recurring'       => false, // generated instances are not templates
                        'created_by'         => $task->created_by,
                        'updated_by'         => $task->created_by,
                    ]);
                }

                $this->line("  [{$date->toDateString()}] {$task->details} (user #{$task->created_by})" . ($dryRun ? ' [DRY RUN]' : ''));
                $created++;
            }
        }

        $this->info("Done. Created: {$created}, Skipped (already exist): {$skipped}.");
        return self::SUCCESS;
    }
}
