<?php

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\Post;
use Inertia\Inertia;

class LikeController extends Controller {



    public function getLikes(Post $post)
    {
        $likes = Like::where('post_id',$post);
        return Inertia::render(
            'Likes',[
                'likes' => $likes,
            ]
            );
    }



}



