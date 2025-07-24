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
        ->where('group_id',null)
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

public function fetch(Request $request)
{
    $seenIds = $request->input('seen_ids', []);
    $groupId = $request->query('group_id');

    $query = Post::with('user')->whereNotIn('id', $seenIds);

    if ($groupId !== null) {
        $query->where('group_id', $groupId);
    } else {
        $query->whereNull('group_id');
    }

    $posts = $query->inRandomOrder()->take(2)->get();
    $newSeenIds = array_merge($seenIds, $posts->pluck('id')->toArray());

    return response()->json([
        'posts' => $posts,
        'seen_ids' => $newSeenIds,
    ]);
}

}
