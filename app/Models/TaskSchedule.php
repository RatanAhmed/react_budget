<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class TaskSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'interval_type',   // daily | weekly | monthly | yearly
        'interval_value',  // every N days/weeks/months/years
        'week_days',       // ["mon","wed","fri"] for weekly
        'month_day',       // 1–31 for monthly/yearly
        'month',           // 1–12 for yearly
    ];

    protected $casts = [
        'week_days'      => 'array',
        'interval_value' => 'integer',
        'month_day'      => 'integer',
        'month'          => 'integer',
    ];

    // ── Relationship ──────────────────────────────────────────────────────────

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    // ── Next occurrence calculator ────────────────────────────────────────────

    /**
     * Given a reference date, return the next occurrence date(s) within a window.
     * Used by the generator command to know which dates to create tasks for.
     *
     * @param  Carbon $from  Start of window (inclusive)
     * @param  Carbon $to    End of window (inclusive)
     * @return Carbon[]
     */
    public function occurrencesBetween(Carbon $from, Carbon $to): array
    {
        $dates = [];

        match ($this->interval_type) {
            'daily'   => $this->dailyOccurrences($from, $to, $dates),
            'weekly'  => $this->weeklyOccurrences($from, $to, $dates),
            'monthly' => $this->monthlyOccurrences($from, $to, $dates),
            'yearly'  => $this->yearlyOccurrences($from, $to, $dates),
        };

        return $dates;
    }

    protected function dailyOccurrences(Carbon $from, Carbon $to, array &$dates): void
    {
        $step = max(1, (int) $this->interval_value);
        $cur  = $from->copy();

        while ($cur->lte($to)) {
            $dates[] = $cur->copy();
            $cur->addDays($step);
        }
    }

    protected function weeklyOccurrences(Carbon $from, Carbon $to, array &$dates): void
    {
        // Map short names → Carbon day constants
        $dayMap = [
            'sun' => Carbon::SUNDAY,
            'mon' => Carbon::MONDAY,
            'tue' => Carbon::TUESDAY,
            'wed' => Carbon::WEDNESDAY,
            'thu' => Carbon::THURSDAY,
            'fri' => Carbon::FRIDAY,
            'sat' => Carbon::SATURDAY,
        ];

        $targetDays = array_map(
            fn ($d) => $dayMap[strtolower($d)] ?? null,
            $this->week_days ?? []
        );
        $targetDays = array_filter($targetDays, fn ($d) => $d !== null);

        if (empty($targetDays)) {
            // Fall back to every N weeks on the task's original day
            $step = max(1, (int) $this->interval_value) * 7;
            $cur  = $from->copy();
            while ($cur->lte($to)) {
                $dates[] = $cur->copy();
                $cur->addDays($step);
            }
            return;
        }

        $cur = $from->copy()->startOfWeek(Carbon::MONDAY);
        while ($cur->lte($to)) {
            foreach ($targetDays as $day) {
                $candidate = $cur->copy()->next($day);
                if ($candidate->lt($from)) {
                    $candidate = $cur->copy()->startOfWeek()->addDays(
                        ($day - $cur->copy()->startOfWeek()->dayOfWeek + 7) % 7
                    );
                }
                if ($candidate->between($from, $to)) {
                    $dates[] = $candidate->copy();
                }
            }
            $cur->addWeeks(max(1, (int) $this->interval_value));
        }
    }

    protected function monthlyOccurrences(Carbon $from, Carbon $to, array &$dates): void
    {
        $day  = $this->month_day ?? $from->day;
        $step = max(1, (int) $this->interval_value);
        $cur  = $from->copy()->startOfMonth();

        while ($cur->lte($to)) {
            // Clamp to last day of month if month_day > days in month
            $candidate = $cur->copy()->setDay(min($day, $cur->daysInMonth));
            if ($candidate->between($from, $to)) {
                $dates[] = $candidate->copy();
            }
            $cur->addMonths($step);
        }
    }

    protected function yearlyOccurrences(Carbon $from, Carbon $to, array &$dates): void
    {
        $month = $this->month     ?? $from->month;
        $day   = $this->month_day ?? $from->day;
        $step  = max(1, (int) $this->interval_value);
        $cur   = $from->copy()->startOfYear();

        while ($cur->lte($to)) {
            try {
                $candidate = Carbon::create($cur->year, $month, $day);
                if ($candidate->between($from, $to)) {
                    $dates[] = $candidate->copy();
                }
            } catch (\Exception) {
                // Invalid date (e.g. Feb 30) — skip
            }
            $cur->addYears($step);
        }
    }

    // ── Human-readable label ──────────────────────────────────────────────────

    public function getFrequencyLabelAttribute(): string
    {
        $n = $this->interval_value;

        return match ($this->interval_type) {
            'daily'   => $n === 1 ? 'Daily' : "Every {$n} days",
            'weekly'  => $this->week_days
                ? 'Weekly (' . implode(', ', array_map('ucfirst', $this->week_days)) . ')'
                : ($n === 1 ? 'Weekly' : "Every {$n} weeks"),
            'monthly' => $n === 1 ? 'Monthly' : "Every {$n} months",
            'yearly'  => $n === 1 ? 'Yearly'  : "Every {$n} years",
            default   => ucfirst($this->interval_type),
        };
    }
}
