<?php

namespace App\Http\Controllers\API\V1;

use App\Models\Menu;
use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $authId = auth()->id();
        $menu = Menu::query();
        
        // $menu->when($request->filled('date'), function ($query) use ($request) {
        //     $query->where('date', $request->date);
        // });

        // $menu->when($request->filled('task_categories_id'), function ($query) use ($request) {
        //     $query->where('task_categories_id', $request->task_categories_id);
        // });

        // $menu->when( $request->filled('status'), function ($query) use ($request) {
        //     $query->where('status', $request->status);
        // });
        
        // $menu->with(['category:id,name']);
        // $menu->where('created_by', $authId);

        return response()->json(MenuResource::collection($menu->get()));
    }

    public function store(Request $request)
    {
        // $validated = $request->validated();
        // if($request->id){
        //     Menu::find($request->id)->update($validated);
        // }else{
        //     Menu::create($validated);
        // }
        // return response()->json(['message' => 'Menu Created']);
    }
}
