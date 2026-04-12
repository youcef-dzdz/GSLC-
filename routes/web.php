<?php

use Illuminate\Support\Facades\Route;

// All routes are handled by the React SPA.
// Laravel only serves the welcome.blade.php entry point.
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
