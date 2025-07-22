<?php

use App\Http\Controllers\FriendController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::resource('friends', FriendController::class)->names('friends');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
