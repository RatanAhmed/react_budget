<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request)
    {
        $statusName = [
            0 => 'Yes',
            1 => 'No',
        ];
        return [
            'id'=> $this->id, 
            'name' => $this->name,
            'image' => $this->image,
            'description' => $this->description,
            'price' => $this->price,
            'available' => $this->available == 1 ? "Yes" : "No",
        ];
    }
}
