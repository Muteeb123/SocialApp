<?php

namespace  Database\Factories;


use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    public function definition(): array
    {
        // Folder where your seed images are stored
        $sourcePath = base_path('database/factories/images');

        // Get all files from that folder
        $files = File::files($sourcePath);

        // Pick a random image file
        $selectedImage = $files[array_rand($files)];

        // Generate a random name with same extension
        $randomName = Str::random(10) . '.' . $selectedImage->getExtension();

        // Destination: storage/app/public/uploads
        $destinationPath = storage_path('app/public/uploads/' . $randomName);

        // Ensure directory exists
        File::ensureDirectoryExists(dirname($destinationPath));

        // Copy the image into the uploads folder
        File::copy($selectedImage->getPathname(), $destinationPath);

        return [
            'user_id' => rand(1, 10),
            'caption' => $this->faker->sentence(),
            'no_of_likes' => 0,
            'no_of_comments' => 0,
            // This path should be accessible via URL as: /storage/uploads/filename.jpg
            'img_url' => 'uploads/' . $randomName,
        ];
    }
}
