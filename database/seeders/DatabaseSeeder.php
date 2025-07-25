<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Friend;
use App\Models\Group;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = User::factory(10)->create();

        // Create 5 groups with a creator
        $groups = Group::factory(5)->create();

        // Attach users randomly to each group
        foreach ($groups as $group) {
            $randomUsers = $users->random(rand(2, 5))->pluck('id')->toArray();
            $group->users()->attach($randomUsers);
        }
    }
}
