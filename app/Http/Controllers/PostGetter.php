<?php

namespace App\Http\Controllers;

use App\Models\Comment as ModelsComment;
use App\Models\Group;
use App\Models\Like;
use App\Models\Post;
use Dom\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PostGetter extends Controller
{






    public function fetch(Request $request)
    {

        $seenIds = $request->input('seen_ids', []);
        $groupId = $request->query('group_id');

        $query = Post::with(['user', 'likes'])
            ->whereNotIn('id', $seenIds)
            ->whereNot('user_id',Auth::id());

        if ($groupId !== null) {
            $group = Group::find($groupId);

            if (!$group || !$group->users()->where('user_id', Auth::id())->exists()) {
                return response()->json([
                    'message' => 'Not Authorized. Showing public posts.',
                    'posts' => Post::with(['user', 'likes'])
                        ->whereNull('group_id')
                        ->whereNotIn('id', $seenIds)
                        ->inRandomOrder()
                        ->take(2)
                        ->get(),
                    'seen_ids' => $seenIds,
                    'error' => 'Not Authorized. Showing public posts.',
                    'groupID' => null
                ], 200);
            }
            $query->where('group_id', $groupId);
        } else {
            $query->whereNull('group_id');
        }

        $posts = $query->inRandomOrder()->take(2)->get();

        $posts->each(function ($post) {
            $post->isliked = $post->likes->contains('user_id', Auth::id());
        });

        $newSeenIds = array_merge($seenIds, $posts->pluck('id')->toArray());
          Log::info('Posts: ' . $posts);
        return response()->json([
            'posts' => $posts,
            'seen_ids' => $newSeenIds,
        ]);
    }

    public function fetchComments(Request $request)
    {
        $postid = $request->post_id;

        $comments = ModelsComment::with('user')
            ->where('post_id', $postid)
            ->latest()
            ->get();

        return response()->json([
            'comments' => $comments
        ]);
    }

    public function fetchLikes(Request $request)
    {
        $postid = $request->post_id;
        Log::info($postid);
        $likes = Like::with('user')->where('post_id', $postid)
            ->latest()
            ->get();
        Log::info($likes);

        return response()->json(
            [
                'likes' => $likes,

            ]
        );
    }

    public function storeComment(Request $request)
    {

        $post_id = $request->input('post_id');
        $text = $request->input('text');

        $post = Post::find($post_id);

        if (!$post) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        $post->no_of_comments += 1;
        $post->save();
        $comment = new ModelsComment();
        $comment->user_id = Auth::id();
        $comment->post_id = $post_id;
        $comment->text = $text;
        $comment->save();

        $comment->load('user');

        return response()->json([
            'comment' => $comment
        ]);
    }

    public function deleteComment($id)
    {
        $comment = ModelsComment::findOrFail($id);

        if ($comment->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $post = Post::Find($comment->post_id);
        $post->no_of_comments -= 1;
        $post->save();
        $comment->delete();

        return response()->json(['success' => true]);
    }
}
