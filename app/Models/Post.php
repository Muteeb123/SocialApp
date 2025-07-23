<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{

    use HasFactory;
    protected $fillable = [
        'user_id',
        'caption',
        'no_of_likes',
        'no_of_comments',
        'img_url',

    ];

      public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // A post has many comments
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    // A post has many likes
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    
}
