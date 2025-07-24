<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Friend;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Like::factory(500)->create()->each(function ($like) {
            $post = $like->post;
            $post->increment('no_of_likes');
        });;
        Comment::factory(500)->create()->each(function ($comment) {
            $post = $comment->post;
            $post->increment('no_of_comments');
        });;
    }
}
