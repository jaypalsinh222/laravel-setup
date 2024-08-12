<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

Route::middleware('auth.ip')->group(function () {
    Route::get('cs-logs', function (Request $request) {
        if ($request->filled('date')) {
            $date = $request->get('date');
            $pathFile = storage_path('logs/laravel-' . $date . '.log');
        } else {
            $pathFile = storage_path('logs/laravel.log');
        }

        if (File::exists($pathFile)) {
            if ($request->filled('clear')) {
                Artisan::call('backup:logs');
            }

            return response(File::get($pathFile))->header('Content-Type', 'text/plain');
        }

        abort(404, 'File not found.');
    });
});


Route::controller(StationController::class)->group(function () {
    Route::post('search-trains', 'searchTrains')->name('search.trains');
});
