<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\TaskCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        $authId = auth()->id();

        return Inertia::render('Settings/Index', [
            // Expense categories only (type = 0)
            'categories'     => Category::where('status', 1)->latest()->get(),
            'taskCategories' => TaskCategory::where('created_by', $authId)->where('status', 1)->latest()->get(),
            'activeTab'      => $request->input('tab', 'categories'),
        ]);
    }
}
