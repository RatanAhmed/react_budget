<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // ── Edit (single task) ────────────────────────────────────────────────
        if ($this->filled('id')) {
            return [
                'date'               => 'required|date',
                'status'             => 'nullable|integer|in:0,1,2,3',
                'remarks'            => 'nullable|string|max:500',
                // Single item fields (sent flat on edit)
                'details'            => 'required|string|max:500',
                'time'               => 'nullable|date_format:H:i',
                'priority'           => 'required|integer|in:1,2,3',
                'task_categories_id' => 'nullable|integer|exists:task_categories,id',
                'is_recurring'       => 'boolean',
                'end_date'           => 'nullable|date|after_or_equal:date',
                'schedule'                    => 'nullable|array',
                'schedule.interval_type'      => 'required_if:is_recurring,true|in:daily,weekly,monthly,yearly',
                'schedule.interval_value'     => 'nullable|integer|min:1|max:365',
                'schedule.week_days'          => 'nullable|array',
                'schedule.week_days.*'        => 'in:sun,mon,tue,wed,thu,fri,sat',
                'schedule.month_day'          => 'nullable|integer|min:1|max:31',
                'schedule.month'              => 'nullable|integer|min:1|max:12',
            ];
        }

        // ── Bulk create (items array) ─────────────────────────────────────────
        return [
            'date'                            => 'required|date',
            'status'                          => 'nullable|integer|in:0,1,2,3',
            'remarks'                         => 'nullable|string|max:500',
            'items'                           => 'required|array|min:1',
            'items.*.details'                 => 'required|string|max:500',
            'items.*.time'                    => 'nullable|date_format:H:i',
            'items.*.priority'                => 'required|integer|in:1,2,3',
            'items.*.task_categories_id'      => 'nullable|integer|exists:task_categories,id',
            'items.*.is_recurring'            => 'boolean',
            'items.*.end_date'                => 'nullable|date',
            'items.*.schedule'                => 'nullable|array',
            'items.*.schedule.interval_type'  => 'nullable|in:daily,weekly,monthly,yearly',
            'items.*.schedule.interval_value' => 'nullable|integer|min:1|max:365',
            'items.*.schedule.week_days'      => 'nullable|array',
            'items.*.schedule.week_days.*'    => 'in:sun,mon,tue,wed,thu,fri,sat',
            'items.*.schedule.month_day'      => 'nullable|integer|min:1|max:31',
            'items.*.schedule.month'          => 'nullable|integer|min:1|max:12',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'                       => 'At least one task is required.',
            'items.*.details.required'             => 'Task details are required.',
            'schedule.interval_type.required_if'   => 'Please select a frequency for the recurring task.',
        ];
    }
}
