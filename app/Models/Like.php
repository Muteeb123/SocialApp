<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{
    //

    protected $fillable = [
        'post_id',
        'user_id'

    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    // A like belongs to a user
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
