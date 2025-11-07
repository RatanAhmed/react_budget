<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request)
    {
        $statusName = [
            0 => 'Pending',
            1 => 'Pending',
        ];
        return [
            'id'=> $this->id, 
            'date'=> $this->date, 
            'time'=> $this->time, 
            'details'=> $this->details, 
            'priority'=> $this->priority, 
            // 'status'=> $statusName[$this->status], 
            'status_name'=> $this->statusName, 
            'remarks'=> $this->remarks, 
            // 'created_by'=> $this->createdBy->name, 
            // 'task_categories_id'=> $this->task_categories_id, 
            'category_name'=> optional($this->category)->name, 
        ];
    }
}
