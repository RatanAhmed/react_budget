<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class,'register'])->name('api.v1.register');
Route::post('/login', [AuthController::class,'login'])->name('api.v1.login');

Route::middleware('auth:sanctum')->name('api.v1.')->group(function () {
    Route::get('/profile', [AuthController::class,'profile'])->name('profile');
    Route::post('/logout', [AuthController::class,'logout'])->name('logout');
    
    Route::apiResource('/tasks', TaskController::class);
});
