<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Friend>
 */
class FriendFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
  
        $sender = User::factory()->create();

        return [
            'receiver_id' => 1,
            'sender_id' => $sender->id,
            'is_accepted' => $this->faker->boolean(50),
        ];
    }
}
