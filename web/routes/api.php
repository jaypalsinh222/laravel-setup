<?php

use App\Http\Controllers\StationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::controller(StationController::class)->group(function () {
    Route::get('get-suggestions', 'getSuggetions')->name('get.stations');
});
