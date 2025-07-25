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
      try {
    Log::info('Post submission started');

        $request->validate([
            'media' => 'required|file|mimes:jpeg,jpg,png,mp4,mov,avi,webm|max:102400000000', 
            'description' => 'nullable|string|max:500',
            'group_id' => 'nullable|string',
        ]);

        Log::info('Validation passed');

        $groupId = $request->input('group_id') === 'public' ? null : (int) $request->input('group_id');

        if (!$request->hasFile('media')) {
            return back()->withErrors(['media' => 'Media upload failed.']);
        }

        $file = $request->file('media');
        $path = $file->store('uploads', 'public');

        $mimeType = $file->getMimeType();
        Log::info('Type: ' . $mimeType);

        $isVideo = str_starts_with($mimeType, 'video/');
        $mediaType = $isVideo ? 'video' : 'image';
         Log::info('Type: ' . $mediaType);
        $post = Post::create([
            'user_id'     => Auth::id(),
            'caption'     => $request->input('description'),
            'group_id'    => $groupId,
            'img_url'     => $path,
            'media_type'  => $mediaType, 
        ]);

          Log::info('Type: ' . $post);
    
} catch (\Exception $e) {
    Log::error('Post creation failed: ' . $e->getMessage());
    return back()->withErrors(['error' => 'Failed to create post.']);
}

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
