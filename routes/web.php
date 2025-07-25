<?php

use App\Http\Controllers\FriendController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostGetter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('login');
})->name('home');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/home', function () {
        return Inertia::render('Posts');
    })->name('dashboard');
    Route::resource('friends', FriendController::class)->names('friends');
    Route::get('/add',[FriendController::class,'search'])->name('friends.search');
    Route::resource('posts',PostController::class)->names('posts');
    Route::get('/how',[PostGetter::class,'fetch']);
    Route::get('/comments',[PostGetter::class,'fetchComments']);
    Route::get('/likes',[PostGetter::class,'fetchLikes']);
    Route::post('/comment',[PostGetter::class,'storeComment']);
    Route::delete('/comment/{id}',[PostGetter::class,'deleteComment']);
    Route::get('/groups',[GroupController::class,'getGroups']);

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
