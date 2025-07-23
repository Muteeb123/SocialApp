<?php

use App\Http\Controllers\FriendController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostGetter;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Posts');
    })->name('dashboard');
    Route::resource('friends', FriendController::class)->names('friends');
    Route::get('/add',[FriendController::class,'search'])->name('friends.search');
    Route::resource('posts',PostController::class)->names('posts');
    Route::get('/how',[PostGetter::class,'fetchOne']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
