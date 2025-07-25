<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;
use phpDocumentor\Reflection\PseudoTypes\LowercaseString;

class GroupController extends Controller
{
    //


    public function getGroups()
    {

        // get the currently authenticated user
        $user = User::find(Auth::id());
        // $groups = $user->groups()->with(['users','creator'])->get(); // get the groups the user belongs to, including members
        $groups = $user->groups()->with(['users', 'creator'])->get();
        return response()->json([
            'groups' => $groups
        ]);
    }

    public function getAllGroups()
    {
        $user = Auth::user();

        $groups = Group::with('creator', 'users') // eager load
            ->get()
            ->map(function ($group) use ($user) {
                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'creator' => [
                        'id' => $group->creator->id,
                        'name' => $group->creator->name,
                    ],
                    'is_member' => $group->users->contains($user->id),
                ];
            });

        return Inertia::render('Groups', [
            'groups' => $groups,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
            ],
        ]);
    }

    public function createGroup(Request $request)
    {
        $name = $request->input('name');
        $creator = Auth::id();
        $uuid = Str::uuid();
        $exist = Group::where('name', $name)->exists();

        if (Str::lower($name) ==='public' ){
            return redirect()->back()->with('error', 'Name: Public is not Allowed');
        }
        if ($exist) {
            return redirect()->back()->with('error', 'Group With Name: ' . $name  . ' Already Exists');
        }
        $group =  Group::create([
            'name' => $name,
            'creator_id' => $creator,
            'group_id'  => $uuid
        ]);
        $group->users()->attach($creator);
        if ($group) {


            return redirect()->back()->with('success', 'Group Created Successfully');
        } else {
            return redirect()->back()->with('error', 'Failed to Create Group');
        }
    }



    public function destroy(Group $group)
    {
        if ($group->creator_id !== Auth::id()) {
            return redirect()->back()->with('error', 'Only the creator can delete this group.');
        }

        $group->delete();

        return redirect()->back()->with('success', 'Group deleted successfully.');
    }

    public function leaveGroup(Group $group)
    {

        $user = User::find(Auth::id());

        
        if (!$group->users->contains($user->id) && $group->creator_id !== $user->id) {
            return back()->with('error', 'You are not a member of this group.');
        }

        if ($group->creator_id === $user->id) {
           
            $otherMembers = $group->users->where('id', '!=', $user->id);

            if ($otherMembers->isEmpty()) {

                $group->delete();
                return back()->with('success', 'Group deleted as no members were left.');
            } else {
               
                $newCreator = $otherMembers->first();
                $group->creator_id = $newCreator->id;
                $group->save();

                $user->groups()->detach($group->id);

                return back()->with('success', 'You left the group and ownership was transferred.');
            }
        } else {
           
            $user->groups()->detach($group->id);
            return back()->with('success', 'You left the group.');
        }
    }

    public function joinGroup(Group $group)
    {
        $user = Auth::user();

        if ($group->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'You are already a member of this group.');
        }

        $group->users()->attach($user->id);

        return back()->with('success', 'You have joined the group.');
    }
}
