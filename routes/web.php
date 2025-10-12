<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('SoftwareCenterLanding', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::group(['middleware' => ['auth', 'verified']], function() {
    Route::resource('/income', IncomeController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('/budget', BudgetController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('/expense', ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('/category', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('/tasks/{task}/update-status', [TaskController::class, 'updateStatus'])->name('tasks.update-status');
    Route::resource('/tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);
});


require __DIR__.'/auth.php';
