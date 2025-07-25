<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    //


    public function getGroups()
    {

 // get the currently authenticated user
        $user = User::find(Auth::id());
        $groups = $user->groups()->with(['users','creator'])->get(); // get the groups the user belongs to, including members
           // $groups = $user->groups()->with(['users', 'creator'])->get();
        return response()->json([
            'groups' => $groups
        ]);
    }
}
