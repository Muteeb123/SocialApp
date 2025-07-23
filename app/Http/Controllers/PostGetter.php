<?php

namespace App\Http\Controllers;

use App\Models\Post;

use Illuminate\Http\Request;

class PostGetter extends Controller
{
public function fetchOne(Request $request)
{   
    $seenIds = $request->input('seen_ids', []);
    
    $posts = Post::with('user')
        ->whereNotIn('id', $seenIds)
        ->inRandomOrder()
        ->take(2)
        ->get();

    if ($posts->isEmpty()) {
        return response()->json([
            'posts' => [],
            'seen_ids' => $seenIds,
        ]);
    }

    // Merge new seen IDs
    $newSeenIds = array_merge($seenIds, $posts->pluck('id')->toArray());

    return response()->json([
        'posts' => $posts,
        'seen_ids' => $newSeenIds,
    ]);
}
}
