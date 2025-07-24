<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        

    //     return Inertia::render('Posts', [
    //         'posts' => [
    //             'groupId' => 1
    //         ],
    //     ]);
     }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        

    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        //
        $like = new Like();
        $like->user_id = Auth::id();
        $like->post_id = $post->id;
        $like->save();

        $post->no_of_likes = $post->no_of_likes + 1; 
        $post->save();
        Log::info('success');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $post->no_of_likes = $post->no_of_likes - 1; 
        $post->save();

        $like = Like::where('user_id',Auth::id())->where('post_id', $post->id);
        $like->delete();
    }
}
