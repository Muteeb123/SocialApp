// routes/api.php
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;

Route::get('/posts/fetch-one', [PostController::class, 'fetchOne']);
