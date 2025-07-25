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
        return Inertia::render('AddPost');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Hello1');
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png|max:2048',
            'description' => 'nullable|string|max:500',
            'group_id' => 'nullable|string' 
        ]);
        Log::info('Hello2');
        $groupId = $request->input('group_id') === 'public' ? null : (int) $request->input('group_id');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('uploads', 'public'); 
        } else {
            return back()->withErrors(['image' => 'Image upload failed.']);
        }

        $post = Post::create([
            'user_id'     => Auth::id(),
            'caption' => $request->input('description'),
            'group_id'    => $groupId,
            'img_url'  => $path,
        ]);

        return redirect()->back()->with('success', 'Post created successfully!');
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

        $like = Like::where('user_id', Auth::id())->where('post_id', $post->id);
        $like->delete();
    }
}
